const {
  Text,
  Color,
  Ellipse,
  Rectangle,
  Line,
  Path,
  RepeatGrid,
  BooleanGroup,
} = require("scenegraph");
const { i18n } = require('../i18n');

let currentID = new Date().getTime();

function getNewID() {
  currentID = currentID + 1;
  return currentID;
}


function getColor(color) {
  const rgba = color.toRgba();
  // 透明度取小数点后两位
  const alpha = rgba.a / 255;
  return {
    r: rgba.r,
    g: rgba.g,
    b: rgba.b,
    a: parseFloat(alpha.toFixed(2)),
  };
}

function decimalFixed(value, count = 2) {
  if (value % 1 === 0) {
    return value;
  }
  return parseFloat(value.toFixed(count));
}

function transparent() {
  return { r: 0, g: 0, b: 0, a: 0 };
}

function parseFill(fill) {
  if(fill) {
    const name = fill.constructor.name;
    if ((name === 'LinearGradientFill') || (name === 'RadialGradientFill')) {
      const { startX, startY, endX, endY, colorStops } = fill;
      const type = (name === 'LinearGradientFill') ? 'linearGradient' : 'radialGradient';
      return {
        type,
        value: {
          fromX: decimalFixed(startX),
          fromY: decimalFixed(startY),
          toX: decimalFixed(endX),
          toY: decimalFixed(endY),
          colorStops: colorStops.map(color => ({
            position: decimalFixed(color.stop), color: getColor(color.color)
          })),
        }
      }
    } else if (fill instanceof Color) {
      return {
        type: 'normal',
        value: getColor(fill),
      }
    }
  }
  return {
    type: 'normal',
    value:transparent(),
  };
}

function parseRadius(cornerRadii) {
  if (cornerRadii) {
    const { topLeft, topRight, bottomLeft, bottomRight } = cornerRadii;
    if (topLeft > 0 || topRight > 0 || bottomLeft > 0 || bottomRight > 0) {
      return [
        decimalFixed(topLeft),
        decimalFixed(topRight),
        decimalFixed(bottomRight),
        decimalFixed(bottomLeft),
      ];
    }
  }
  return null;
}

function parseStroke(node) {
  const {
    stroke, effectiveCornerRadii, strokeEnabled, strokePosition, strokeWidth,
    strokeDashArray, strokeDashOffset,
  } = node;
  const radius = parseRadius(effectiveCornerRadii);
  const result = {};
  if (radius) {
    result.radius = radius;
  }
  if (stroke && strokeEnabled && !(node instanceof Text)) {
    result.borders = [{
      type: strokePosition,
      strokeWidth: decimalFixed(strokeWidth),
      color: parseFill(stroke),
      dash: strokeDashArray,
      offset: decimalFixed(strokeDashOffset),
    }];
  }
  return result;
}

function parseShadow(shadow) {
  if (!shadow) {
    return null;
  }
  const {
    x, y, blur, color, visible,
  } = shadow;
  if (!visible) {
    return null;
  }
  return [{
    offsetX: decimalFixed(x),
    offsetY: decimalFixed(y),
    blur: decimalFixed(blur),
    color: parseFill(color),
    spread: 0,
  }];
}

function parseBlur(blur) {
  if (!blur || !blur.visible) {
    return null;
  }
  return {
    type: 'gaussian',
    radius: decimalFixed(blur.blurAmount),
  }
}

function parseEffect(data, shadow, blur) {
  if (!shadow && !blur) {
    return;
  }

  data.effect = {

    shadows: parseShadow(shadow),
    blur: parseBlur(blur),
  };
}

function parseSceneNode(node, data, artboardPosition) {
  const {
    guid, name, constructor, opacity, rotation, localBounds,shadow,
    globalDrawBounds,
    globalBounds, boundsInParent,
  } = node;

  const left = globalBounds.x - artboardPosition.x;
  const top = globalBounds.y - artboardPosition.y;
  const { width, height } = boundsInParent;
  let  type = constructor.name;
  if (constructor.name ==='Rectangle' || constructor.name === 'Ellipse') {
    type = 'shape'
  }
  data.basic = {
    id: guid,
    type,
    name: name || type,
    opacity: decimalFixed(opacity),
    zIndex: -1, // FIXME: 获取数据
  };
  data.bounds = {
    left: Math.round(width) ? Math.round(left):Math.round(left)-1,
    top: Math.round(height) ? Math.round(top):Math.round(top)-1,
    width:  Math.ceil(width) === 0? 1 : Math.ceil(width),
    height: Math.ceil(height) === 0? 1 : Math.ceil(height),
    effectWidth:  shadow && shadow.visible? globalDrawBounds.width : null,
    effectHeight:  shadow && shadow.visible? globalDrawBounds.height : null,
  };

  if (rotation) {
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    data.transform = {
      rotation: {
        rotation,
        width: localBounds.width,
        height: localBounds.height,
        x: Math.round(centerX - localBounds.width / 2),
        y: Math.round(centerY - localBounds.height / 2),
      },
    };
  }
}

function parseGraphicsNode(node, data) {
  const {
    fill, fillEnabled, strokeEnabled, shadow, blur,
  } = node;
  if (fillEnabled && !(node instanceof Text)) {
    data.fill = {
      colors: [parseFill(fill)],
    }
  } else {
    data.fill = {};
  }
  if (strokeEnabled) {
    data.stroke = parseStroke(node);
  } else {
    data.stroke = {};
  }
  parseEffect(data, shadow, blur);
}

function parseRectangle(node, data) {
  const { effectiveCornerRadii } = node;
  const radius = parseRadius(effectiveCornerRadii);
  if (radius) {
    data.stroke.radius = radius;
  }
}

function parseEllipse(node, data) {
  delete data.stroke.radius;
  data.stroke.isCircle = true;
}

function parseText(node, data) {
  const { text, styleRanges, textAlign, lineSpacing } = node;
  let start = 0;
  data.text = {
    styles: styleRanges.map(style => {
      const styleData = {
        font: {
          family: style.fontFamily,
          weight: style.fontStyle,
          color: parseFill(style.fill),
          size: style.fontSize,
        },
        align: textAlign,
        space: {
          lineHeight: decimalFixed(lineSpacing),
          letterSpacing: style.charSpacing,
        },
        fontStyles: {
          underLine: style.underline,
        },
        // 此处当长度为1时获取的数据有总是，为排除了标点符号的长度
        value: (style.length !== 0 && styleRanges.length !== 1) ? text.substr(start, style.length) : node.text,
      };
      start += style.length;
      return styleData;
    }),
  }
}

function parseLine(node, data) {
  const { start, end } = node;
  data.extend = {
    line: {
      start,
      end,
    }
  }
}

function parsePath(node, data) {
  const { pathData } = node;
  data.extend = {
    path: pathData,
  };
}

function getParser(node) {
  if (node instanceof Text) {
    return parseText;
  } else if (node instanceof Rectangle) {
    return parseRectangle;
  } else if (node instanceof Ellipse) {
    return parseEllipse;
  } else if (node instanceof Line) {
    return parseLine;
  } else if (node instanceof Path) {
    return parsePath;
  }
  return null;
}

function nodeToData(node, artboardPosition) {
  let layer = node;
  if (node instanceof RepeatGrid) {
    layer = node.children.at(0);
  }

  const data = {
    slice: {},
    effect: {},
    fill: {},
    stroke: {},
    text: {},
    flow: {},
  };
  parseSceneNode(layer, data, artboardPosition);
  parseGraphicsNode(layer, data);
  const parseFunc = getParser(node);
  if (parseFunc) {
    parseFunc(layer, data, artboardPosition);
  }
  return data;
}

function parseLayers(node, layers, artboardPosition, markedToExportNodes) {
  if (node.isContainer && node.children.length > 0) {
    const count = node.children.length;
    const isBooleanGroup = node instanceof BooleanGroup;
    node.children.forEach((cnode, i) => {
      if (isBooleanGroup && i === count - 1) {
        return;
      }
      const layerData = nodeToData(cnode, artboardPosition);
      if (layerData) {
        layers.push(layerData);
        if (cnode.markedForExport) {
          const id = getNewID();
          markedToExportNodes.push({
            id, node: cnode,
          });
          layerData.waitForExported = id;
        }
      }
      parseLayers(cnode, layers, artboardPosition, markedToExportNodes);
    });
  }
}

function exportArtboard(artboard, markedToExportNodes, device) {
  const { guid, name, width, height, globalDrawBounds } = artboard;
  if(width > 5000 || height > 5000) {
    throw Error(i18n('export.uploadingError'))
  }
  const { x, y } = globalDrawBounds;
  const { value, sliceScale, artboardScale } = device;
  const data = {
    artboardID: guid,
    name,
    source: 'xd',
    version: 1,
    device: value,
    sliceScale: sliceScale,
    artboardScale: artboardScale,
    markedForExport: artboard.markedForExport,
    size: {
      width,
      height,
    },
    positionX: x,
    positionY: y,
    layers: [],
  };
  parseLayers(artboard, data.layers, globalDrawBounds, markedToExportNodes);
  return data;
}

function getArtboardsData(artboards, markedToExportNodes, device) {
  return artboards.map(artboard => exportArtboard(artboard, markedToExportNodes, device));
}

module.exports = {
  getNewID,
  getArtboardsData,
};

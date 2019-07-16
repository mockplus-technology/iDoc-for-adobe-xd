const projectsFormat = (projects) => {
  let result = [];
  if (!projects) {
    return result;
  }
  // 先排序，项目集在前面
  projects = projects.sort((a, b) => b.isAppSet - a.isAppSet);
  projects.forEach(item => {
    if (item.isAppSet) {
      let children = item.appSets.map(app => {
        return {
          id: app._id,
          name: app.name,
          title: app.name,
          value: app._id,
        }
      });
      result.push({
        id: item._id,
        name: item.name,
        children,
      });
    } else {
      result.push({
        id: item._id,
        name: item.name,
      })
    }
  })
  return result;
}

const formatAllApp = (projects) => {
  let result = [];
  if (!projects) {
    return result;
  }
  projects.forEach(item => {
    if (item.isAppSet && item.appSets.length !== 0) {
      result.push(...item.appSets)
    } else {
      result.push(item)
    }
  })
  return result;
}

const truncate = (string) => {
  if (string.length > 20) {
    return string.slice(0, 20) + '...';
  } else {
    return string
  }
}


module.exports = {
  projectsFormat,
  formatAllApp,
  truncate
};
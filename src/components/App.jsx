const React = require('react');
const {Artboard} = require("scenegraph");
const { i18n } = require('../i18n');
const { urlCfg } = require('../utils/urlUtils');
const OS =require('os')
const { Menu } = require('./common');
const CreateAppPanel = require('./CreateAppPanel.jsx');
const TeamsPanel = require('./TeamsPanel.jsx');
const Progress = require('./AppComs/Progress.jsx');
const AppsPanel = require('./AppsPanel.jsx');
const DevicesPanel = require('./DevicesPanel.jsx');
const { exportArtboards, getExportArtboardDatas ,getExportArtboards, 
       } = require('../utils/export');
const { loadAllTeams, loadApps, createApp, getToken, getAllCopy, getAllAppSet} = require('../utils/apis');
const deviceCfg = require('../constants/deviceCfg');
const menuConfig = require('../constants/MenuOptions');
const StateTip = require('./StateTip.jsx');
const StateListMenu =  require('./StateListMenu.jsx');
const { saveLastSelectApp, saveDevice, getDevice, saveSelectTeamID } = require('../utils/localCache');
const Version = require('./AppComs/Version.jsx');
const isMac =  require('../utils/isWin.js');
const UploadTip = require('./common/UploadTip.jsx')
const {formatAllApp} =  require('../utils/projectsFormat.js');
require('./App.scss');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      popupMenu: false,
      appID: props.appID,
      apps: props.apps,
      teams: props.teams,
      teamID: props.teamID,
      appSetList: [],
      device: getDevice() || deviceCfg.IOS[0],
      showCreate: false,
      showNewVersion: false,
      newVersion: null,
      // 是否显示菜单
      showMenu: false,
      showTeamsPanel: false,
      progress: null,
      showAppsPanel: false,
      showDevicesPanel: false,
      disabled: false,
      stateTip: false,
      showStateListMenu: false,
      stateList: [],
      newStateItem:{},
      showTip:false,
      num:null
    };
    this.handleSettingMenuItemSelected = this.handleSettingMenuItemSelected.bind(this);
    this.onExportAll = this.onExportAll.bind(this);
    this.checkState = this.checkState.bind(this)
    this.onExportCurrent = this.onExportCurrent.bind(this);
    this.onDeviceSelect = this.onDeviceSelect.bind(this);
    this.onAppSelect = this.onAppSelect.bind(this);
    this.onTeamSelect = this.onTeamSelect.bind(this);
    this.onCreateNewApp = this.onCreateNewApp.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
    this.popupMessage = this.popupMessage.bind(this);
    this.openMenu = this.openMenu.bind(this);
    this.onDismissMenu = this.onDismissMenu.bind(this);
    this.hideAllPopup = this.hideAllPopup.bind(this);
    this.getNewStateList =  this.getNewStateList.bind(this)
    this.getRoleInTeam =  this.getRoleInTeam.bind(this)
    this.onCloseTip = this.onCloseTip.bind(this)
  }

  componentDidMount() {
    // 设置了一个隐藏的输入框，并且获取焦点，
    // 为了防止下面的下拉菜单获取到焦点
    // ，会出现一个边框，并且将覆盖到所有组件上，影响菜单，弹出面板等
    this.hiddenInput.focus();
  }

  handleSettingMenuItemSelected(menu) {
    const { id } = menu;
    this.setState({ popupMenu: false });
    switch (id) {
      case 'newProject':
        this.setState({ showCreate: true, showMenu: false });
        break;
      case 'switchTeam':
        this.setState({ showTeamsPanel: true, showMenu: false })
        break;
      case 'switchAccount':
        this.setState({ showMenu: false });
        this.props.onLogout();
        break;
      default:
        break;
    }
  }

  popupMessage(message) {
    const { showMessage } = this.props;
    if (showMessage) {
      showMessage(message);
    }
  }
  getRoleInTeam(){
    const {teams,teamID} = this.state
    const roleInTeam= teams.filter(item=>item.id===teamID)[0].roleInTeam
    return roleInTeam
  }
  onExportCurrent() {
    const { selection} = this.props;
    const roleInTeam = this.getRoleInTeam()

    if (!selection.focusedArtboard) {
      this.popupMessage(i18n('app.noSelected'));
      return;
    }
    if(roleInTeam==='guest'){
      this.props.showMessage(i18n('error.noPermission'));
      return 
    }
    let selectedArtboard = [selection.focusedArtboard];
    if (selection.items && selection.items.length > 0) {
      if (selection.items[0] instanceof Artboard) {
        selectedArtboard = selection.items;
      }
    }
    // 禁止重复提交
    this.setState({ disabled: true }, () => {

      exportArtboards(this.state.appID, selectedArtboard, this.state.device, info => {
        this.setState({
          progress: info,
        });
      }).then(res => {
        this.setState({
          progress: null,
          disabled: false,
        });
        this.setState({showTip:true, num: res.length})
        // this.popupMessage(i18n('app.uploadSuccess', res.length));
      }).catch(e => {
        this.setState({
          progress: null,
          disabled: false,
        });
        this.props.showMessage(e);
      });
    });
  }

  onExportAll() {
    const artboards = this.getAllArtboards();
    const roleInTeam = this.getRoleInTeam()
    if(roleInTeam==='guest'){
      this.props.showMessage(i18n('error.noPermission'));
      return 
    }
    this.setState({ disabled: true }, () => {
      exportArtboards(this.state.appID, artboards, this.state.device, info => {
        this.setState({
          progress: info,
        });
      }).then((res) => {
        this.setState({
          progress: null,
          disabled: false,
        });
        this.setState({showTip:true, num: res.length})
        // this.popupMessage(i18n('app.uploadSuccess', res.length));
      }).catch(e => {
        this.setState({
          progress: null,
          disabled: false,
        });
        this.props.showMessage(e);
      });
    });
  }
  checkState(){
    const { selection, } = this.props;
    const { appID } = this.state
    const roleInTeam = this.getRoleInTeam()
    if (!selection.focusedArtboard) {
      this.popupMessage(i18n('app.noSelected'));
      return;
    }
    if(roleInTeam==='guest'){
      this.props.showMessage(i18n('error.noPermission'));
      return 
    }
    let selectedArtboard = [selection.focusedArtboard];
    if (selection.items && selection.items.length > 0) {
      if (selection.items[0] instanceof Artboard) {
        selectedArtboard = selection.items;
      }
    }
    //上传状态图的画板
    getExportArtboardDatas(selectedArtboard, this.state.device).then(res=>{
      const clientID = res[0].id
      getAllCopy(appID,clientID).then(res=>{
        if(res.length){
          getExportArtboards(this.state.appID, selectedArtboard, this.state.device)
          .then(res=>{this.setState({newStateItem:res[0]})})
          .catch(err=>console.log(err));
          this.setState({showStateListMenu:true,stateList:res})
        }else{
          this.setState({ disabled: true }, () => {
            exportArtboards(this.state.appID, selectedArtboard, this.state.device, info => {
              this.setState({
                progress: info,
              });
            }).then(res => {
              this.setState({
                progress: null,
                disabled: false,
              });
              this.setState({showTip:true, num: res.length})
              // this.popupMessage(i18n('app.uploadSuccess', res.length));
            }).catch(e => {
              this.setState({
                progress: null,
                disabled: false,
              });
              this.props.showMessage(e);
            });
          });
        }
        })
    })
  }

  getAllArtboards() {
    const { documentRoot, } = this.props;
    return documentRoot.children.filter((node) => node instanceof Artboard);
  }

  onDeviceSelect(device) {
    if (device !== undefined) {
      this.setState({ device, showDevicesPanel: false }, () => {
        saveDevice(device);
      })
    }
  }

  onAppSelect(app) {
    const appID = app._id;
    this.setState({ appID, showAppsPanel: false }, () => {
      saveLastSelectApp(appID);
    });
  }

  onTeamSelect(team) {
    const teamID = team.id;
    this.setState({ showTeamsPanel: false });
    if (teamID !== this.state.teamID) {
      this.setState({ teamID, appID: null }, () => {
        saveSelectTeamID(teamID);
        this.props.showWaiting(true);
        loadApps(teamID).then((apps) => {
          this.setState({ apps });
          if (apps && apps.length) {
            const allApp = formatAllApp( apps )
            this.setState({ appID: allApp[0]._id });
          }
          this.props.showWaiting(false);
        }).catch((e) => {
          this.props.showMessage(e);
          this.props.showWaiting(false);
        })
      });
    }
  }
  getNewStateList(newStateList) {
    this.setState({stateList:newStateList})
  }
  onRefresh() {
    this.props.showWaiting(true);
    loadAllTeams().then((teams) => {
      this.setState({ teams });
      if (teams && teams.length) {
        let teamID = this.state.teamID;
        if (!teams.find(team => team.id === teamID)) {
          teamID = teams[0].id;
          this.setState({ teamID });
        }
        loadApps(teamID).then((apps) => {
          this.setState({ apps });
          let appID = this.state.appID;
          if (apps && apps.length) {
            const allApp = formatAllApp( apps )
            if (!allApp.find(app => app._id === appID)) {
              appID = allApp[0]._id;
              this.setState({ appID });
            }
          } else {
            this.setState({ appID: null });
          }
          this.popupMessage(i18n('app.dataIsRefresh'));
          this.props.showWaiting(false);
        }).catch(e => {
          this.setState({ appID: null });
          this.popupMessage(e);
          this.props.showWaiting(false);
        });
      } else {
        this.setState({
          teamID: null,
          apps: null,
          appID: null,
        });
        this.props.showWaiting(false);
      }
    }).catch(e => {
      this.setState({ teamID: null });
      this.popupMessage(e)
      this.props.showWaiting(false);
    })
  }

  onCreateNewApp(data) {
    this.setState({ showCreate: false });
    const app = data;
    data.teamID = this.state.teamID;
    this.props.showWaiting(true);
    createApp(app).then((res) => {
      let apps = this.state.apps || [];
      if(data.appSetID) {
        apps = apps.map(item => {
          if(item._id === data.appSetID) {
             item.appSets.push(res)
          }
          return item
        })
        this.setState({ apps, appID: res._id });
        this.props.showWaiting(false);
      } else {
        apps.push(res);
        this.setState({ apps, appID: res._id });
        this.props.showWaiting(false);
      }
    
    }).catch(e => {
      this.popupMessage(e);
      this.props.showWaiting(false);
    });
  }

  openMenu(e) {
    e.stopPropagation();
    this.setState({
      showMenu: true,
    });
  }

  onDismissMenu() {
    this.setState({
      showMenu: false,
    });
  }

  hideAllPopup() {
    this.setState({
      showMenu: false,
      showAppsPanel: false,
      showTeamsPanel: false,
      showCreate: false,
      showDevicesPanel: false,
    })
  }
  onCloseTip(){
    this.setState({
      showTip:false,
      num: null,
    })
  }
  
  render() {
    const { selection, showMessage } = this.props;
    const { appID, showCreate, teams, apps, device, disabled, stateTip, stateList,
       showStateListMenu, teamID, newStateItem, num } = this.state;
    const canExportCurrent = selection.focusedArtboard !== null && !disabled && appID;
    let selCount = selection.focusedArtboard !== null ? 1 : 0;
    if (selection.hasArtboards) {
      selCount = selection.items.length;
    }
    const artboards = this.getAllArtboards();
    const canExportAll = artboards.length > 0 && !disabled && appID && artboards.length > 0;
    let selApp;
    const allApp = formatAllApp(apps)
    if (apps) {
      selApp = allApp.find(app => app._id === appID);
    }
    return (
      <div className="c-app">
        <input className="hidden-input" type="text" ref={node => this.hiddenInput = node}/>
        <div className="actions" disabled={disabled}>
          <div
            className="choose-app"
            onClick={(e) => {
              e.stopPropagation();
              this.setState({ showAppsPanel: true })
            }}>
            <span>
            {
              selApp ? selApp.name : i18n('app.chooseProject')
            }
            </span>
            <img className="arrow" src="/images/icons/arrow.png"/>       
          </div>
          <div className="menu-actions">
          <div
            className="add-btn"
            title={i18n('menu.newProject')}
            onClick={(e)=> {
              e.stopPropagation();
              getAllAppSet(teamID).then(res=>{
                this.setState({appSetList:res})
              })
              this.setState({ showCreate: true })
            }}
          >
            <img src="/images/icons/add.png"/>
          </div>
            <div className="refresh icon-button" onClick={this.onRefresh} title={i18n('app.refresh')}>
              <img src="/images/icons/refresh.png" alt={i18n('app.refresh')}/>
            </div>
            <div className="settings icon-button" title={i18n('app.settings')}>
              <img onClick={this.openMenu} src="/images/icons/menu.png" alt={i18n('app.settings')}/>
            </div>
          </div>
        </div>
        <div className="artboards-info">
          <p>{i18n('app.artboardSelectedCount', artboards.length, selCount)}</p>
        </div>
        <div>
          <div className="device-box" onClick={(e) => {
            e.stopPropagation();
            this.setState({ showDevicesPanel: true })
          }}>
            <span>{device ? device.name : i18n('app.chooseDevice')}</span>
            <img src="/images/icons/arrow.png" className="arrow"/>
          </div>
          <button
            uxpVariant="primary"
            className="upload-select app-btn"
            disabled={!canExportCurrent}
            onClick={this.onExportCurrent}
          >
            {i18n('app.uploadSelected')}
          </button>
          <button
            className="update-all app-btn"
            disabled={!canExportAll}
            onClick={this.onExportAll}
          >
            {i18n('app.uploadAll')}
          </button>
          <div className="state-box app-btn">
          <button
            className="update-state"
            disabled={!canExportAll}
            onClick={this.checkState}
          >
            {i18n('multiStatus.uploadstateImg')}
          </button> 
          <img src="/images/icons/about.png" className={`${isMac.isMac?'about':'is-mac-about'}`}  onClick={()=>{ this.setState({stateTip:true})}}/>
          </div>
        </div>
        <div className="app-bottom">
          <Version/>
          <a className={`my-app${selApp ? '' : ' disabled-link'}`}
             href={`${urlCfg.myApp}?appID=${appID}&token=${getToken()}`}>
            {i18n('app.myProject')}
          </a>
        </div>
        {showCreate&&<CreateAppPanel
          visible={showCreate}
          onCreate={this.onCreateNewApp}
          appSetList = {this.state.appSetList}
          showMessage={showMessage}
          selApp = {selApp}
          onClose={(e) => {
            e.stopPropagation();
            this.setState({ showCreate: false })
          }}
        />
        }
        {
          stateTip&&<StateTip 
          visible={stateTip}
            onClose={(e) => {
              e.stopPropagation();
              this.setState({ stateTip: false })
          }}
          />
        }
        {
          showStateListMenu&&<StateListMenu
          stateList={stateList}
          showMessage={showMessage}
          showStateListMenu={showStateListMenu}
          getNewStateList={this.getNewStateList}
          newStateItem={newStateItem}
          showUploadTip={()=>{this.setState({showTip:true})}}
          onClose={(e) => {
          e.stopPropagation();
          this.setState({ showStateListMenu: false,newStateItem:{} })
          }}
        />
        }
        <TeamsPanel
          teams={teams}
          visible={this.state.showTeamsPanel}
          onSelected={this.onTeamSelect}
          newTeamID={teamID}
          onClose={(e) => {
            e.stopPropagation();
            this.setState({ showTeamsPanel: false })
          }}
        />
        <AppsPanel
          apps={apps}
          Selected={selApp}
          visible={this.state.showAppsPanel}
          onSelected={this.onAppSelect}
          onClose={(e) => {
            e.stopPropagation();
            this.setState({ showAppsPanel: false })
          }}
        />
        <DevicesPanel
          devices={deviceCfg.all()}
          value={device}
          onSelected={this.onDeviceSelect}
          visible={this.state.showDevicesPanel}
          onClose={(e) => {
            e.stopPropagation();
            this.setState({ showDevicesPanel: false })
          }}
        />
        <Menu
          isShow={this.state.showMenu}
          items={menuConfig}
          onItemClick={this.handleSettingMenuItemSelected}
          onDismissMenu={this.onDismissMenu}
        />
        {this.state.showTip&&
        <UploadTip url={`${urlCfg.homePage}/app/${appID}/storyboard`} 
        num={num} onClose={this.onCloseTip}/>
        }
        <Progress progress={this.state.progress}/>
      </div>
    );
  }
}

module.exports = App;

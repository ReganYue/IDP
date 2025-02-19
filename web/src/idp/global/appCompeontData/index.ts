import { action, observable } from "mobx"
import React, { useId } from "react"
import projectApi from "@/services/projectApi"
import { locationToProjectListPage } from "@/utils"
import cookie from 'react-cookies';

export type IdpProject = {
  id?: string,
  name?: string,
  [x: string]: any
}

class AppComponentData {
  @observable projectInfo: IdpProject
  @observable workspaceRef: any
  @observable notebookTabRef: React.RefObject<any>
  @observable socketAlive: boolean

  constructor() {
    this.projectInfo = {}
    this.notebookTabRef = React.createRef()
    this.socketAlive = true
  }

  @action setSocketAlive(socketAlive: boolean) {
    this.socketAlive = socketAlive
  }


  @action getProjectInfo(projectInfo: IdpProject) {
    let projectId = new URLSearchParams(window.location.search).get("projectId");
    if (projectId) {
      // 等待接口
      if (Boolean(process.env.NODE_OPEN)) {
        this.projectInfo = { id: cookie.load('projectId'), name: cookie.load('projectId') };
      } else {
        projectApi
          .getProjectInfo(projectId)
          .then((res) => {
            const projectInfo = res.data
            this.projectInfo = projectInfo
            window.localStorage.setItem("historyOpenProject", projectId)
          })
          .catch((res) => {
            locationToProjectListPage()
          })
      }
    } else {
      let search = window.location.search
      projectId = window.localStorage.getItem("historyOpenProject");
      let pathname = `./workspace`;
      if (process.env.REACT_APP_VERSION === 'MODEL') {
        pathname = `./modelwarehouse/myModel`;
      }
      const url = (window.__POWERED_BY_QIANKUN__ ? window.location.pathname : pathname);
      if (projectId) {
        if (search) {
          search += `&projectId=${projectId}`
        } else {
          search = `?projectId=${projectId}`
        }
        window.location.href = `${url}${search}`;
      } else {
        const qs = new URLSearchParams(search)
        const shareId = qs.get("shareId")
        // debugger
        if (shareId) {
          // 打开分享链接中的文件
          projectApi.getProjectPage({ current: 1, size: 5, name: '' }).then((result) => {
            const { records: projectList } = result.data
            projectId = projectList[0].id
            if (search) {
              search += `&projectId=${projectId}`
            } else {
              search = `?projectId=${projectId}`
            }
            window.location.href = `${url}${search}`
          })
        } else {
          if (process.env.REACT_APP_VERSION === 'MODEL') {
            if ( cookie.load('userId')) {
              projectApi.getProjectPage({ current: 1, size: 1 }).then(res => {
                if (res.code == 200 && res.data.records.length > 0) {
                  window.location.href = `/studio/modelwarehouse/myModel?projectId=${res.data.records[0].id}`;
                } else {
                  locationToProjectListPage()
                }
              });
            } else {
              if ( window.location.pathname !== '/studio/modelwarehouse/myModel') {
                locationToProjectListPage()
              }
            }
          } else {
            locationToProjectListPage()
          }
        }
      }
    }
  }

}


export default AppComponentData


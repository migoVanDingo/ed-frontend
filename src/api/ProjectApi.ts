import { ProjectEndoint, ServicePort } from "../utility/constants/serviceConstants"
import { AbstractAPI } from "./AbstractApi"
import { Requests } from "./Requests"

export class ProjectAPI extends AbstractAPI {
  public static create = async (payload: any) =>
    Requests.doPost(payload, ProjectEndoint.CREATE, ServicePort.PROJECT)

  public static update = async (payload: any) =>
    Requests.doPut(payload, ProjectEndoint.UPDATE, ServicePort.PROJECT)


  // TODO Needs project ID in endpoint
  public static delete = async () =>
    Requests.doDelete(ProjectEndoint.DELETE, ServicePort.PROJECT)

  public static fetch = async () =>
    Requests.doGet(ProjectEndoint.READ, ServicePort.PROJECT)
}

import { Requests } from "./Requests"

const ServicePort = {
    UPLOAD_SESSION: "5006"
} as const

export class UploadSession {
    public static upload = async (payload: any) => 
        Requests.uploadFile(
            payload, 
            "/api/upload/session", 
            ServicePort.UPLOAD_SESSION,
            sessionStorage.getItem("accessToken")
            
        )

    public static openUploadSession = async (payload: any) => 
        Requests.doPost(
            payload, 
            "/api/upload/session", 
            ServicePort.UPLOAD_SESSION,
            { Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`}
            
        )
    
} 
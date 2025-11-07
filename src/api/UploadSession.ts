import { Requests } from "./Requests"

const ServicePort = {
    UPLOAD_SESSION: "5006"
} as const

export class UploadSession {
    public static openUploadSession = async (payload: any) => 
        Requests.uploadFile(
            payload, 
            "/api/upload/session", 
            ServicePort.UPLOAD_SESSION,
            sessionStorage.getItem("accessToken")
            
        )
    
} 
import React, { useEffect } from "react"
import {
  useNavigate,
  useOutletContext,
  useSearchParams,
} from "react-router-dom"
import { runTaskSequence } from "../utility/callback/runTaskSequence"
import { UserAPI } from "../api/UserApi"

const AcceptInvite = () => {
  const { setModalText, setLoading } = useOutletContext<any>()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const nav = useNavigate()
  const handleNavigate = () => {
    setLoading(false)
    nav("/login")
  }

  const verifyAccount = async (token: string | null, cancel: () => void) => {
    if (!token) {
      console.error("No token provided")
      cancel()
      nav("/error")
      throw new Error("No token provided")
    }
    const response = await UserAPI.verifyAccount(token)
    if (!response || !response.success) {
      console.error("Account verification failed")
      setModalText(
        "Verification failed. Please contact support and provide id: " + token
      )
      cancel() // Cancel the sequence if verification fails
    }
  }

  useEffect(() => {
    const { cancel } = runTaskSequence([
      {
        name: "step1",
        duration: 0,
        tasks: [
          {
            name: "VERIFY_ACCOUNT",
            callback: () => setModalText("Verifying Account"),
          },
          { name: "SET_LOADING_TRUE", callback: () => setLoading(true) },
          { name: "TOKEN", callback: () => verifyAccount(token, cancel) },
        ],
      },
      {
        name: "step2",
        duration: 2000,
        tasks: [
          {
            name: "REDIRECTING",
            callback: () =>
              setModalText("Account Verified! Redirecting to Login Page"),
          },
        ],
      },
      {
        name: "step3",
        duration: 2000,
        tasks: [{ name: "navigate", callback: () => handleNavigate() }],
      },
    ])
  }, [])
  return <></>
}

export default AcceptInvite

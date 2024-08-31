import { validateTelegramWebAppData } from "../../utils/telegramAuth"
import { SESSION_DURATION , encrypt} from "../../utils/session"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  const {initData} = await request.json()

  const validationResult = validateTelegramWebAppData(initData)

  if(validationResult.validatedData) {
    console.log("Validation result: ", validationResult)
    const user = {telegramId: validationResult.user.id}

      // Create a new session
    const expires = new Date(Date.now() + SESSION_DURATION)
    const session = await encrypt(JSON.stringify({ user, expires }))

    // Save session to cookies
    cookies().set("session", session, {expires, httpOnly: true})

    return NextResponse.json({ message: "Telegram data is valid"})



  } else {
    return NextResponse.json({ message: validationResult.message}, {status: 401})
  }


  // Use isValid in your response logic
}
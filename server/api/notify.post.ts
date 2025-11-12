import { Resend } from 'resend'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  // Note: The RESEND_API_KEY must be set in your environment variables.
  const resend = new Resend(config.resendApiKey)

  try {
    const { repo } = await readBody(event)

    if (!repo || typeof repo !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request: Repository name is required and must be a string.'
      })
    }

    const subject = `Subscribed to ${repo} updates`
    const emailBodyAsText = `This is a confirmation that you have successfully subscribed to notifications for new releases of the repository: ${repo}.\n\nYou will receive an email whenever a new version is published.`

    const { data, error } = await resend.emails.send({
      from: 'Repo Updates <onboarding@resend.dev>',
      to: ['ronitchhabriawork@gmail.com'], // Hardcoded as requested for the free tier
      subject: subject,
      text: emailBodyAsText
    })

    if (error) {
      console.error({ message: 'Resend API Error', details: error })
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to send email due to an internal error.'
      })
    }

    return { success: true, messageId: data?.id }
  } catch (e: any) {
    console.error({ message: 'Notify API handler error', details: e.message })
    // Re-throw the error to be handled by Nuxt's error handling
    if (e.statusCode) {
      throw e
    }
    // Create a generic server error if it's not a known H3Error
    throw createError({
      statusCode: 500,
      statusMessage: 'An unexpected error occurred.'
    })
  }
})

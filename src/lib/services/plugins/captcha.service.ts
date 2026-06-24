export interface BetterAuthFetchOptions {
  headers?: Record<string, string | undefined>
  [key: string]: unknown
}

export interface CaptchaFetchOptions {
  fetchOptions: BetterAuthFetchOptions
}

export function captchaHeaders(response: string): Record<string, string> {
  return { 'x-captcha-response': response }
}

export function captchaFetchOptions(response: string, fetchOptions: BetterAuthFetchOptions = {}): CaptchaFetchOptions {
  return {
    fetchOptions: {
      ...fetchOptions,
      headers: {
        ...fetchOptions.headers,
        ...captchaHeaders(response),
      },
    },
  }
}

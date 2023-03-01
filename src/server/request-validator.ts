import { ZodError, type ZodSchema } from 'zod'
import { forbidden, unprocessableEntity } from './responses'

type Options<Data> = {
  schema: ZodSchema<Data>
  authorize?: (request: Request) => Promise<boolean> | boolean
}

async function getFormData(request: Request) {
  return Object.fromEntries((await request.formData()).entries())
}

export function createRequestValidator<Data>({ authorize, schema }: Options<Data>) {
  async function checkAuthorization(request: Request) {
    const isAuthorized = authorize ? await authorize(request) : true
    if (!isAuthorized) throw forbidden('Forbidden.')
  }

  return (request: Request) => {
    return {
      async formData() {
        await checkAuthorization(request)

        const parsed = schema.safeParse(await getFormData(request))

        return parsed.success
          ? ({ success: true, data: parsed.data } as const)
          : ({ success: false, errors: parsed.error.flatten() } as const)
      },

      async formDataOrThrow() {
        await checkAuthorization(request)

        try {
          return schema.parse(await getFormData(request))
        } catch (exception) {
          if (exception instanceof ZodError<Data>) {
            throw unprocessableEntity(exception.errors)
          }
        }
      },
    }
  }
}

import { ZodError, type ZodSchema } from 'zod'
import { forbidden, unprocessableEntity } from './responses'

type Options<Data> = {
  schema: ZodSchema<Data>
  authorize?: (request: Request) => boolean | PromiseLike<boolean>
}

async function getFormData(request: Request) {
  return Object.fromEntries((await request.formData()).entries())
}

export function createRequestValidator<Data>({ authorize, schema }: Options<Data>) {
  async function checkAuthorization(request: Request) {
    const isAuthorized = authorize ? await authorize(request) : true
    if (!isAuthorized) {
      throw await forbidden('Forbidden')
    }
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
          const formData = await getFormData(request)
          return schema.parse(formData)
        } catch (exception) {
          if (exception instanceof ZodError) {
            throw unprocessableEntity(exception.errors)
          }
          throw exception
        }
      },
    }
  }
}

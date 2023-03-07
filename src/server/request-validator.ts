import { ZodError, type ZodSchema } from 'zod'
import { forbidden, unprocessableEntity } from './responses'

class RequestValidator<Data> {
  constructor(
    private readonly request: Request,
    private readonly schema: ZodSchema<Data>,
    private readonly authorize: (request: Request) => boolean | PromiseLike<boolean>
  ) {}

  private async getFormData() {
    return Object.fromEntries((await this.request.formData()).entries())
  }

  private async checkAuthorization() {
    const isAuthorized = await this.authorize(this.request)
    if (!isAuthorized) {
      throw await forbidden('Forbidden')
    }
  }

  /**
   * Get request body as a parsed object
   *
   * @returns {success: true, data: Data} | {success: false, errors: ZodError}
   */
  public async formData() {
    await this.checkAuthorization()

    const parsed = this.schema.safeParse(await this.getFormData())

    return parsed.success
      ? ({ success: true, data: parsed.data } as const)
      : ({ success: false, errors: parsed.error.flatten() } as const)
  }

  /**
   * Get request body as a parsed object or throw 422
   *
   * @returns {Data} | throws 422
   */
  public async formDataOrThrow() {
    await this.checkAuthorization()

    try {
      const formData = await this.getFormData()
      return this.schema.parse(formData)
    } catch (exception) {
      if (exception instanceof ZodError) {
        throw unprocessableEntity(exception.errors)
      }
      throw exception
    }
  }
}

export function createRequestValidator<Data>({
  authorize,
  schema,
}: {
  schema: ZodSchema<Data>
  authorize?: (request: Request) => boolean | PromiseLike<boolean>
}) {
  return (request: Request) => new RequestValidator(request, schema, authorize ?? (() => true))
}

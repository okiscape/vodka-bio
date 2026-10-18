import type {
  FastifyReply,
  FastifyRequest,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
  RouteGenericInterface,
  RouteHandlerMethod,
} from 'fastify'

type RouteGeneric = RouteGenericInterface

export function wrap<G extends RouteGeneric = RouteGeneric>(
  handler: (request: FastifyRequest<G>, reply: FastifyReply<G>) => Promise<unknown> | unknown
): RouteHandlerMethod<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  G
> {
  return (async (request: FastifyRequest<G>, reply: FastifyReply<G>) => {
    try {
      return await handler(request, reply)
    } catch (err) {
      const status = typeof err === 'object' && err !== null && 'statusCode' in err &&
        typeof (err as { statusCode?: unknown }).statusCode === 'number'
        ? (err as { statusCode: number }).statusCode
        : 500

      if (status >= 400 && status < 500) {
        request.log.warn(err)
        return sendError(reply, status, err instanceof Error ? err.message : 'Bad request')
      }

      request.log.error(err)
      return sendError(reply, 500, 'Internal server error')
    }
  }) as RouteHandlerMethod<
    RawServerDefault,
    RawRequestDefaultExpression<RawServerDefault>,
    RawReplyDefaultExpression<RawServerDefault>,
    G
  >
}

export function sendError(reply: FastifyReply, statusCode: number, message: string) {
  return reply.status(statusCode).send({ ok: false, message })
}

export function isSafeFilename(name: string): boolean {
  if (!name || name === '.' || name === '..') return false
  if (name.includes('/') || name.includes('\\') || name.includes('\0') || name.includes('..')) return false
  if (name === 'metadata.json') return false
  return true
}

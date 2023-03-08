import { randomUUID } from "crypto"
import { FastifyInstance } from "fastify"
import { knex } from '../database'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'



export async function transactionsRoutes(app: FastifyInstance){

    app.get('/', {
        preHandler: [checkSessionIdExists],
    },
    async (request) => {
        
        const { sessionId } = request.cookies

        const transactions = await knex('transactions').select()

        return { transactions }
    })

    app.get('/:id',{
        preHandler: [checkSessionIdExists],
    },
     async (request) => {
        const getTransactionParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = getTransactionParamsSchema.parse(request.params)

        const { sessionId } = request.cookies

        const transaction = await knex('transactions')
        .where({
            session_id: sessionId,
            id,
        })
        .first()

        return transaction
    })

    app.get('/summary', async(request) => {

        const { sessionId } = request.cookies

        const summary = await knex('transactions').sum('amount', { as: 'amount'})
        .where('session_id', sessionId)
        .first()

        return { summary }
    })

    app.post('/', async (request, response) =>{
    
    const createTransactionBodyScjema = z.object({
        title: z.string(),
        amount: z.number(),
        type: z.enum(['credit', 'debit']),
    })

    const {title, amount, type} = createTransactionBodyScjema.parse(request.body)

    let sessionId = request.cookies.sessionId
    if (!sessionId){
        sessionId = randomUUID()

        response.cookie('sessionId', sessionId, {
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days 


        })
    }

    await knex('transactions').insert({
        id: randomUUID(),
        title,
        amount: type === 'credit' ? amount: amount * -1,
        session_Id: sessionId,
    })
    return response.status(201).send()
})
}

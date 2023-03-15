import { afterAll, beforeAll, it, describe, expect, beforeEach } from "vitest";
import { execSync } from "child_process";
import request from 'supertest'
import { app } from '../src/app'

describe('Transaction routes', () => {

    beforeAll(async () =>{
        await app.ready()
    })
       
    afterAll( async () =>{
           await app.close()
    })

    beforeEach(() => {
        execSync('npm run knex migrate:rollback --all')
        execSync('npm run knex migrate:latest') 
    })
       
       
    it('should be able to create a new transaction', async () => {
       // teste e2e 
       await request(app.server)
       .post('/transactions')
       .send({
           title: 'New transaction',
           amount: 5000,
           type: 'credit',
       })
       .expect(201)
    })
       
    it('should be able to list all transactions', async () => {
        
        const createTransactioResponse = await request(app.server)
                
        .post('/transactions')
        .send({
            title: 'New transaction',
            amount: 5000,
            type: 'credit',
        })

        const cookies = createTransactioResponse.get('Set-Cookie')

        const listTransactionsReponse =  await request(app.server)
            .get('/transactions')
            .set('Cookie', cookies)
            .expect(200)

        expect(listTransactionsReponse.body.transactions).toEqual([
            expect.objectContaining({
                title: 'New transaction',
                amount: 5000,
            }),
        ])
    })    

    it('should be able to get a specific transaction', async () => {
        
        const createTransactioResponse = await request(app.server)
        .post('/transactions')
        .send({
            title: 'New transaction',
            amount: 5000,
            type: 'credit',
        })

        const cookies = createTransactioResponse.get('Set-Cookie')

        const listTransactionsReponse =  await request(app.server)
            .get('/transactions')
            .set('Cookie', cookies)
            .expect(200)

        const transactionId = listTransactionsReponse.body.transactions[0].id

        const getTransactionsReponse =  await request(app.server)
            .get(`/transactions/${transactionId}`)
            .set('Cookie', cookies)
            .expect(200)


        expect(getTransactionsReponse.body.transaction).toEqual(
            expect.objectContaining({
                title: 'New transaction',
                amount: 5000,
            }),
        )
    })    

    it('should be able to get thr summary', async () => {
        
        const createTransactioResponse = await request(app.server)
        .post('/transactions')
        .send({
            title: 'New transaction',
            amount: 5000,
            type: 'credit',
        })

        const cookies = createTransactioResponse.get('Set-Cookie')

        await request(app.server)
        .post('/transactions')
        .set('Cookie', cookies)
        .send({
            title: 'New transaction',
            amount: 2000,
            type: 'debit',
        })

        const summaryResponse =  await request(app.server)
            .get('/transactions/summary')
            .set('Cookie', cookies)
            .expect(200)

        expect(summaryResponse.body.summary).toEqual(
            {
             amount: 3000,
            })
        
    })   
})


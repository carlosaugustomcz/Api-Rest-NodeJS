import { table } from "console";
import { Knex } from "knex";
import { SCHEMA } from "sqlite3";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('transactions', (table) => {
        table.uuid('id').primary()
        table.text('title').notNullable()
        table.decimal('amount', 10, 2).notNullable()
        table.timestamp('create_at').defaultTo(knex.fn.now()).notNullable

    })
}


export async function down(knex: Knex): Promise<void> {
   await knex.schema.dropTable('transactions') 
}


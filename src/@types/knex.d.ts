// definição de tipos
import { Knex } from "knex";

declare 'knex/types/tables' {
    export interface Tables {
        transactions: {
            id: string,
            title: string,
            amount: number,
            create_at: string,
            session_id:? string
        }
    }
    };
    

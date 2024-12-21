use anchor_lang::prelude::*;

use crate::state::pool::Pool;

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(init, payer = admin, space = 8+32+8)]
    pub pool: Account<'info, Pool>,

    #[account(mut)]
    pub admin: Signer<'info>,

    // system program
    pub system_program: Program<'info, System>,
}

impl<'info> InitializePool<'info> {
    pub fn initialize_pool(ctx: Context<InitializePool>) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.admin = *ctx.accounts.admin.key;

        msg!("Admin key: {}", ctx.accounts.admin.key());

        pool.balance = 0;
        Ok(())
    }
}

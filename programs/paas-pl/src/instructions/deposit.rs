use anchor_lang::{
    prelude::*,
    solana_program::{native_token::LAMPORTS_PER_SOL, program::invoke, system_instruction},
};

use crate::state::pool::Pool;

#[derive(Accounts)]
pub struct DepositConfig<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub user: Signer<'info>,
    // system program
    pub system_program: Program<'info, System>,
}

impl<'info> DepositConfig<'info> {
    pub fn deposit(ctx: Context<DepositConfig>, amount: u64) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let pool_key = pool.to_account_info().key;
        let user = &mut ctx.accounts.user;

        invoke(
            &system_instruction::transfer(&user.key, pool_key, amount * LAMPORTS_PER_SOL),
            &[ctx.accounts.user.to_account_info(), pool.to_account_info()],
        )?;

        pool.balance += amount * LAMPORTS_PER_SOL;

        Ok(())
    }
}

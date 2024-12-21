use anchor_lang::prelude::*;

#[account]
#[derive(Copy)]
pub struct Pool {
    pub admin: Pubkey,
    pub balance: u64,
}

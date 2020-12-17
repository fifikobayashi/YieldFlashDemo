const Pool = artifacts.require('Pool')
const FYDaiMock = artifacts.require('FYDaiMock')
const DaiMock = artifacts.require('DaiMock')
const FlashBorrower = artifacts.require('YieldDaiBorrowerMock')

import { keccak256, toUtf8Bytes } from 'ethers/lib/utils'
// @ts-ignore
import helper from 'ganache-time-traveler'
import { rate1, daiTokens1, toWad, almostEqual } from './shared/utils'
import { Contract } from './shared/fixtures'
// @ts-ignore
import { BN, expectRevert } from '@openzeppelin/test-helpers'
import { assert } from 'chai'

contract('YieldDaiBorrower', async (accounts) => {
  let [owner, user1] = accounts

  const initialDai = daiTokens1

  let snapshot: any
  let snapshotId: string

  let dai: Contract
  let pool: Contract
  let fyDai: Contract
  let borrower: Contract

  let maturity0: number

  beforeEach(async () => {
    snapshot = await helper.takeSnapshot()
    snapshotId = snapshot['result']

    // Setup fyDai
    const block = await web3.eth.getBlockNumber()
    maturity0 = (await web3.eth.getBlock(block)).timestamp + 15778476 // Six months

    dai = await DaiMock.new("Test", "TST")
    fyDai = await FYDaiMock.new("Test", "TST", maturity0)

    // Setup Pools
    pool = await Pool.new(dai.address, fyDai.address, 'Name', 'Symbol', { from: owner })

    // Initialize pools
    const additionalFYDaiReserves = toWad(34.4)

    await dai.mint(user1, initialDai, { from: user1 })
    await dai.approve(pool.address, initialDai, { from: user1 })
    await pool.mint(user1, user1, initialDai, { from: user1 })
    await fyDai.mint(owner, additionalFYDaiReserves, { from: owner })
    await fyDai.approve(pool.address, additionalFYDaiReserves, { from: owner })
    await pool.sellFYDai(owner, owner, additionalFYDaiReserves, { from: owner })

    // Set up the FlashBorrower
    borrower = await FlashBorrower.new(dai.address, { from: owner })
    await borrower.setPool(pool.address, { from: owner })
  })

  it('should do a simple flash loan from an EOA', async () => {
    const ONE = new BN(toWad(1).toString())
    const loan = ONE

    const expectedFee = await borrower.flashFee(loan)

    await dai.mint(user1, ONE, { from: user1 })
    await dai.transfer(borrower.address, ONE, { from: user1 })

    const balanceBefore = await dai.balanceOf(borrower.address)
    await borrower.flashBorrow(loan, { from: user1 })

    assert.equal(await borrower.sender(), user1)

    assert.equal((await borrower.loanAmount()).toString(), loan.toString())

    assert.equal((await borrower.balance()).toString(), balanceBefore.add(loan).toString())

    const fee = await borrower.fee()
    assert.equal((await dai.balanceOf(borrower.address)).toString(), balanceBefore.sub(fee).toString())
    almostEqual(fee.toString(), expectedFee.toString(), fee.div(new BN('100000')).toString()) // Accurate to 0.00001 %
  })
})

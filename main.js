const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits', // 翻第一張牌
  SecondCardAwaits: 'SecondCardAwaits', // 翻第二張牌
  CardsMatchFailed: 'CardsMatchFailed', // 配對成功
  CardsMatched: 'CardsMatched', // 配對失敗
  GameFinished: 'GameFinished' // 遊戲結束
}
const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
]
const view = {
  // 紙牌區塊
  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>`
  },
  // 紙牌正面內容
  getCardContent(index) {
    // 52張牌換算
    const number = this.transformNumber((index % 13) + 1)
    // 花色
    const symbol = Symbols[Math.floor(index / 13)]
    return `
      <p>${number}</p>
      <img src="${symbol}" />
      <p>${number}</p>
    `
  },
  // 特殊紙牌數字轉換
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
  flipCards(...cards) {
    cards.map(card => {
      // 背面轉換正面給予數字花色
      // 刪除背面花色
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      // 給予背面花色
      // 清空牌值
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  // 配對成功樣式
  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('.score').innerHTML = `Score ${score}`
  },

  renderTriedTimes(triedTimes) {
    document.querySelector('.tried').innerHTML =  `You've tried: ${triedTimes} times`
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
  },

  // 結束畫面
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}
const model = {
  score: 0,
  triedTimes: 0,
  // 顯示卡片
  revealedCards: [],
  // 顯示卡片匹配
  isRevealedCardsMatched() {
    // 匹配紙牌數字是否相同
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  }
}
const controller = {
  // 預設目前狀態為 第一張牌
  currentState: GAME_STATE.FirstCardAwaits,
  // 紙牌生成
  generateCards() {
    // utility 亂數產生紙牌
    view.displayCards(utility.getRandomNumberArray(52))
  },

  dispatchCardAction(card) {
    //紙牌名稱沒有back 就跳出
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          // 配對成功
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()  // 加在這裡
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          // 隔1秒後執行function
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    console.log('this.currentState', this.currentState)
    console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
  },
// 刷新畫面
  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}
const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}
controller.generateCards()
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})
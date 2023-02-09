function prepareSendMail (e) {
  e.preventDefault()
  const data = {
    name: formMail.name.value,
    email: formMail.email.value,
    text: formMail.message.value
  }

  const resultContainer = mailContainer.querySelector('.status')
  const { name, email, text } = data
  if (name && email && text) {
    if(resultContainer.classList.contains('hidden')) {
      resultContainer.innerHTML = 'Sending...'
      resultContainer.classList.remove('hidden')
    }
  }

  sendJson('/', data, 'POST', data => {
    if (data) {
      formMail.reset()
      if(resultContainer.classList.contains('hidden')) {
        resultContainer.classList.remove('hidden')
      }
      resultContainer.innerHTML = data.msg
    }
  })
}

function sendJson (url, data, method, cb) {
  // eslint-disable-next-line no-undef
  const xhr = new XMLHttpRequest()
  xhr.open(method, url)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.onload = function () {
    let result
    try {
      result = JSON.parse(xhr.responseText)
    } catch (err) {
      // eslint-disable-next-line node/no-callback-literal
      cb({ msg: `Sorry, there is an error in the data: ${err}`, status: 'Error' })
    }
    cb(result)
  }
  xhr.send(JSON.stringify(data))
}

const formMail = document.querySelector('#form-email')
const mailContainer = document.querySelector('#mail')
formMail.addEventListener('submit', prepareSendMail)

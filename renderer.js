const getSubmitButton = () => {
  return document.getElementById('btn')
}

const getRoot = () => {
  return document.getElementById("root")
}

async function onSubmit () {
  const formData = {
    subredditName: document.getElementById('subreddit').value,
    filterParams: document.getElementById("filterParams").value
  }
  window.electronAPI.setSubredditInfo(formData)
}

function onKeyPress(event) {
  event.preventDefault();
  // 'Enter' key
  if (event.keyCode === 13) {
    getSubmitButton().click();
  }
}

getRoot().addEventListener("keyup", onKeyPress);
getSubmitButton().addEventListener('click', onSubmit)

window.electronAPI.setPage((event, value) => {
  getRoot().innerHTML = value
  if (value.includes("<p>No such subreddit exists. Please select again!</p>")) {
    getSubmitButton().addEventListener('click', onSubmit)
    getRoot().addEventListener("keyup", onKeyPress);
  }
})
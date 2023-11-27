/**
 * Author: EvenZhu
 * Create Date: 2023.11.26
 * 掘金增强扩展的文章模版配置页面的js
 */

const storage = chrome.storage.local;
let manifest; // Chrome扩展工程配置文件

fetch('manifest.json')
  .then((response) => response.json())
  .then(res => {
    manifest = res
    title.innerText = `${title.innerText}  v${manifest.version}`;
  });

const resetButton = document.querySelector('button.reset');
const submitButton = document.querySelector('button.submit');
const textarea = document.querySelector('textarea');

// 读取之前存储的文章模版
loadTemplate();

submitButton.addEventListener('click', saveChanges);
resetButton.addEventListener('click', reset);

async function saveChanges() {
  const template = textarea.value;
  if (!template) {
    message('文章模版不得为空！', true);
    return;
  }

  // 存储文章模版到chrome本地存储
  await storage.set({ template });
  message('文章模版保存成功！');
}

function loadTemplate() {
  storage.get('template', function (items) {
    if (items.template) {
      textarea.value = items.template;
    }
  });
}

async function reset() {
  await storage.remove('template');
  message('文章模版重置完成！');
  textarea.value = '';
}

let messageClearTimer;
const messageNode = document.querySelector('.message');
function message(msg, isError = false) {
  messageNode.style.display = 'block';
  clearTimeout(messageClearTimer);
  messageNode.innerText = msg;
  messageNode.style.color = isError ? 'red' : 'green';
  messageClearTimer = setTimeout(function () {
    messageNode.innerText = '';
    messageNode.style.display = 'none';
  }, 2500);
}

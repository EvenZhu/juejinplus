/**
 * Author: EvenZhu
 * Create Date: 2023.11.26
 * 扩展程序的popup引入的js
 */

// 文章模版存储在chrome本地存储
const storage = chrome.storage.local;

function messageLink(tip, content, link) {
  const optionsPageLink = document.createElement('a');
  optionsPageLink.target = '_blank';
  optionsPageLink.href = chrome.runtime.getURL(link);
  optionsPageLink.textContent = content;
  if (link.indexOf('https://') > -1) {
    optionsPageLink.onclick = (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: link });
    }
  }
  message.innerText = '';
  message.appendChild(document.createTextNode(tip));
  message.appendChild(optionsPageLink);
}

async function run() {
  // 获取模版内容
  const items = await storage.get('template');
  const [currentTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });
  if (currentTab.url.indexOf('https://juejin.cn') === -1) {
    messageLink('请在掘金写文章页面或掘金社区，使用掘金增强扩展：', '掘金写文章页面', 'https://juejin.cn/editor/drafts/new?v=2');
    return
  }
  if (items.template) {
    try {
      await chrome.scripting.executeScript({
        target: {
          tabId: currentTab.id,
        },
        args: [items],
        func: (param) => {
          const aidPrefix = 'SLARDAR';
          const aidKeys = Object.keys(localStorage).filter(key => key.startsWith(aidPrefix));
          const aids = aidKeys.filter(key => !Number.isNaN(Number.parseInt(key.replace(aidPrefix, ''))));
          if (aids.length !== 1) {
            return;
          }

          const aid = aids[0].replace(aidPrefix, '');
          const cacheToken = localStorage.getItem(`__tea_cache_tokens_${aid}`);
          const { user_unique_id: uuid } = JSON.parse(cacheToken);
          console.log(aid, '-', uuid);

          console.log('items = ', param);

          const create = `https://api.juejin.cn/content_api/v1/article_draft/create?aid=${aid}&uuid=${uuid}`;
          const createData = {
            "category_id": "0",
            "tag_ids": [],
            "link_url": "",
            "cover_image": "",
            "title": "",
            "brief_content": "",
            "edit_type": 10,
            "html_content": "deprecated",
            "mark_content": param.template,
            "theme_ids": []
          };
          const dataString = JSON.stringify(createData);
          console.log(dataString);
          fetch(create, {
            method: 'POST',
            headers: {
              "Content-Type": 'application/json; charset=utf-8'
            },
            encoding: 'utf-8',
            credentials: 'include',
            body: dataString
          })
            .then((response) => response.json())
            .then((data) => {
              console.log('Network...', data);
              if (data.err_no === 0 && data.data.id) {
                window.location.href = `https://juejin.cn/editor/drafts/${data.data.id}`;
              }
            });
        }
      });
      message.innerText = '掘金文章模版导入成功！';
    } catch (e) {
      console.error(e);
      message.innerText = '导入失败，请检查文章模版是否配置正确！';
    }
  } else {
    messageLink('请先点击下面的链接配置文章模版：', '文章模版配置页面', 'options.html');
  }
}

run();

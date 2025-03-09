const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const fs = require('fs').promises
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

// 中间件
app.use(cors())
app.use(bodyParser.json())

// 存储设置的文件路径
const SETTINGS_FILE = path.join(__dirname, 'settings.json')

// 读取设置
async function readSettings() {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    // 如果文件不存在，返回默认设置
    return {
      models: {},
      defaultModel: 'gpt-4'
    }
  }
}

// 保存设置
async function saveSettings(settings) {
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2))
}

// 获取设置
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await readSettings()
    res.json(settings)
  } catch (error) {
    res.status(500).json({ error: '读取设置失败' })
  }
})

// 保存设置
app.post('/api/settings', async (req, res) => {
  try {
    const settings = req.body
    await saveSettings(settings)
    res.json({ success: true, message: '设置保存成功' })
  } catch (error) {
    res.status(500).json({ error: '保存设置失败' })
  }
})

// 测试 AI 模型连接
app.post('/api/test-connection', async (req, res) => {
  const { modelId, apiKey, endpoint } = req.body
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: 'test' }]
      })
    })
    
    if (!response.ok) {
      throw new Error('API 请求失败')
    }
    
    res.json({ success: true, message: '连接测试成功' })
  } catch (error) {
    res.status(500).json({ success: false, message: `连接测试失败: ${error.message}` })
  }
})

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`)
}) 
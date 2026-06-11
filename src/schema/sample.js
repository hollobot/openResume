/**
 * 示例简历数据（中文，内容迁移自 docs/语法.md 的真实简历）
 * 用于「新建简历 → 使用示例数据」与首次迁移演示
 */

import { uid } from './uid.js'
import { normalizeResumeData } from './index.js'

export function createSampleResumeData() {
  return normalizeResumeData({
    basics: {
      name: '陶 潇',
      headline: 'Java 开发工程师',
      email: '2380983020@qq.com',
      phone: '13203071697',
      location: '长沙',
      website: { url: 'https://hollobot.github.io/blog', label: '个人博客' },
      customFields: [],
    },
    summary: {
      title: '个人简介',
      content:
        '<p>在校期间多次参与算法竞赛并取得优异成绩，具备扎实的算法设计与优化能力；独立开发多个实战项目，熟悉全栈开发流程，具备全栈开发经验。</p>',
    },
    sections: {
      profiles: {
        title: '',
        icon: 'messenger-logo',
        columns: 1,
        hidden: false,
        items: [
          {
            id: uid(),
            hidden: false,
            icon: 'github-logo',
            iconColor: '',
            network: 'GitHub',
            username: 'hollobot',
            website: { url: 'https://github.com/hollobot', label: 'github.com/hollobot', inlineLink: false },
          },
        ],
      },
      education: {
        title: '',
        icon: 'graduation-cap',
        columns: 1,
        hidden: false,
        items: [
          {
            id: uid(),
            hidden: false,
            school: '中南林业科技大学涉外学院',
            degree: '全日制本科',
            area: '计算机科学与技术',
            grade: '',
            location: '',
            period: '2022-09 ~ 2026-06',
            website: { url: '', label: '', inlineLink: false },
            description: '',
          },
        ],
      },
      skills: {
        title: '',
        icon: 'compass-tool',
        columns: 1,
        hidden: false,
        items: [
          {
            id: uid(),
            hidden: false,
            icon: '',
            iconColor: '',
            name: 'Java 编程',
            proficiency: '',
            level: 0,
            keywords: ['集合框架', '多线程并发', 'JVM'],
          },
          {
            id: uid(),
            hidden: false,
            icon: '',
            iconColor: '',
            name: '开发框架',
            proficiency: '',
            level: 0,
            keywords: ['Spring Boot', 'Spring Cloud', 'MyBatis'],
          },
          {
            id: uid(),
            hidden: false,
            icon: '',
            iconColor: '',
            name: '数据库与中间件',
            proficiency: '',
            level: 0,
            keywords: ['MySQL', 'Redis', 'RabbitMQ'],
          },
        ],
      },
      experience: {
        title: '',
        icon: 'briefcase',
        columns: 1,
        hidden: false,
        items: [
          {
            id: uid(),
            hidden: false,
            company: '北京智乐活科技有限公司',
            position: 'Java 实习生',
            location: '长沙',
            period: '2025-07 ~ 至今',
            website: { url: '', label: '', inlineLink: false },
            description:
              '<p>参与适趣 AI 中文（儿童阅读 APP）后端核心功能开发与后台运营系统迭代。</p><ul><li><p>基于 Spring Event 实现事件驱动架构，将喂食、签到等行为动作与金币/经验副作用解耦。</p></li><li><p>使用 Redisson 分布式锁保护金币变更、签到、虚拟商品购买等并发写入。</p></li><li><p>对接阿里 DashScope 大模型，实现绘本对话与日常对话两种会话类型。</p></li></ul>',
            roles: [],
          },
        ],
      },
      projects: {
        title: '',
        icon: 'code-simple',
        columns: 1,
        hidden: false,
        items: [
          {
            id: uid(),
            hidden: false,
            name: 'SwiftChat 跨平台 IM 系统',
            period: '2025-02 ~ 2025-05',
            website: {
              url: 'https://github.com/hollobot/chat-server',
              label: 'github.com/hollobot/chat-server',
              inlineLink: false,
            },
            description:
              '<p>基于 Spring Boot + Electron-Vite 的跨平台 IM 系统，支持单聊/群聊、好友管理、媒体文件发送、点对点视频通话。</p><ul><li><p>基于 Netty 构建 WebSocket 长连接管理，实现心跳检测与消息实时推送。</p></li><li><p>引入 Redisson 实现多节点 WebSocket 消息同步，支持服务端集群部署。</p></li><li><p>集成 WebRTC 实现点对点视频通话，降低音视频流延迟。</p></li></ul>',
          },
        ],
      },
      awards: {
        title: '',
        icon: 'trophy',
        columns: 1,
        hidden: false,
        items: [
          {
            id: uid(),
            hidden: false,
            title: '传智杯程序设计挑战赛校赛一等奖',
            awarder: '',
            date: '2024-12',
            website: { url: '', label: '', inlineLink: false },
            description: '',
          },
          {
            id: uid(),
            hidden: false,
            title: '全国程序设计天梯赛三等奖',
            awarder: '',
            date: '2025-04',
            website: { url: '', label: '', inlineLink: false },
            description: '',
          },
        ],
      },
    },
  })
}

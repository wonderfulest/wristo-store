import type { BlogPostTocItemVO, BlogPostVO } from '@/types'
import { SUPPORTED_LOCALES } from '@/store/locale'
import { legacyFaqGuidePosts } from './faq-pages-legacy'

const author = {
  id: 300,
  username: 'Wristo',
  nickname: 'Wristo',
  avatar: '/logo.svg',
}

const category = {
  id: 100,
  name: 'FAQ',
  slug: 'faq',
}

const now = '2026-06-15T00:00:00.000Z'

function post(
  id: number,
  slug: string,
  translations: BlogPostVO['translations'],
  tags: BlogPostVO['tags'] = [],
): BlogPostVO {
  return {
    id,
    categoryId: category.id,
    authorId: author.id,
    coverImageUrl: '',
    isPublished: 1,
    publishedAt: now,
    viewCount: 0,
    slug,
    createdAt: now,
    updatedAt: now,
    translations,
    author,
    category,
    tags,
  }
}

function tr(lang: string, slug: string, title: string, summary: string, contentHtml: string) {
  return {
    lang,
    slug,
    title,
    summary,
    contentHtml,
    url: `/${lang}/faq/${slug}`,
  }
}

function withSupportedFaqLocales(translations: BlogPostVO['translations']): BlogPostVO['translations'] {
  const source = translations.find((translation) => translation.lang === 'en') || translations[0]
  if (!source) return translations

  return SUPPORTED_LOCALES.map((locale) => {
    const existing = translations.find((translation) => translation.lang === locale)
    if (existing) return existing
    return tr(locale, source.slug, source.title, source.summary, source.contentHtml)
  })
}

const curatedFaqGuidePosts = [
  post(1000, 'faq', withSupportedFaqLocales([
    tr(
      'en',
      'faq',
      'Wristo FAQ',
      'Start here for Wristo installation, activation, purchase, settings, and troubleshooting help.',
      `<p>Find the situation that matches what you see on your watch, phone, or order page, then follow the steps for that issue.</p>
<h2>Start with your current situation</h2>
<ul>
  <li><strong>You want to try a watch face:</strong> install it from Garmin Connect IQ, sync the watch, then open the watch face on the device.</li>
  <li><strong>Your watch shows a six-digit code:</strong> open <a href="https://wristo.io/code">wristo.io/code</a>, enter the purchase email and the code, then sync Garmin Connect.</li>
  <li><strong>You already paid but see a payment prompt:</strong> sign in on <a href="https://www.wristo.io/">wristo.io</a> with the purchase email, then open <a href="https://www.wristo.io/en/code">wristo.io/en/code</a>. You can also use <a href="https://www.wristo.io/already-purchased">already purchased</a> without signing in by entering the purchase email and the six-digit code shown on the watch.</li>
  <li><strong>You want a refund or purchase record:</strong> check your history first, then contact support if the order is still unclear.</li>
  <li><strong>The watch face crashes or shows IQ:</strong> update firmware, reinstall the face, and send the Connect IQ log if it continues.</li>
</ul>
<h2>Where to go next</h2>
<ol>
  <li>Confirm that your watch model is compatible with the watch face.</li>
  <li>Confirm that Garmin Connect / Connect IQ App is connected to the watch.</li>
  <li>If the issue involves payment or activation, use the original purchase email first.</li>
  <li>If the issue is a crash, keep the screenshot, watch face name, watch model, and firmware version.</li>
</ol>
<p>Choose the topic that matches your issue: activation, purchases, installation and sync, settings, or IQ error troubleshooting.</p>`,
    ),
    tr(
      'zh',
      'faq',
      'Wristo 常见问题',
      '从这里开始解决 Wristo 表盘安装、激活、购买、设置和故障排查问题。',
      `<p>如果你在安装、激活、付款、同步或使用表盘时遇到问题，可以先找到最接近你当前情况的一项，再按步骤处理。</p>
<h2>先看你属于哪种情况</h2>
<ul>
  <li><strong>想安装或试用表盘：</strong>先在 Wristo 找到表盘，跳转 Garmin Connect IQ 安装，然后保持手机和手表同步。</li>
  <li><strong>手表上出现 6 位激活码：</strong>打开 <a href="https://wristo.io/code">wristo.io/code</a>，输入购买邮箱和手表上的 6 位码，完成后同步 Garmin Connect。</li>
  <li><strong>已经付费但又提示付款：</strong>先用购买邮箱登录 <a href="https://www.wristo.io/">wristo.io</a>，再打开 <a href="https://www.wristo.io/en/code">wristo.io/en/code</a> 激活；也可以在未登录状态打开 <a href="https://www.wristo.io/already-purchased">already purchased</a>，输入购买邮箱和手表上的 6 位数字恢复授权。</li>
  <li><strong>要找购买记录或申请退款：</strong>先去购买记录页面确认订单，再按退款规则联系支持。</li>
  <li><strong>表盘显示 IQ 或无法运行：</strong>优先更新固件、重装表盘、保持同步；仍无效时发送日志给支持团队。</li>
</ul>
<h2>推荐处理顺序</h2>
<ol>
  <li>确认手表型号和表盘是否兼容。</li>
  <li>确认 Garmin Connect / Connect IQ App 与手表处于连接状态。</li>
  <li>如果涉及付款或激活，优先使用原购买邮箱。</li>
  <li>如果问题和崩溃有关，保留截图、表盘名称、手表型号和系统版本。</li>
</ol>
<p>选择和当前问题最接近的主题即可：激活、购买、安装与同步、表盘设置，或 IQ 错误排查。</p>`,
    ),
  ])),
  post(1001, 'activation-code', withSupportedFaqLocales([
    tr(
      'en',
      'activation-code',
      'Activation Code and Trial Unlock',
      'How to unlock a Wristo watch face when a six-digit code appears.',
      `<h2>When do I need a code?</h2>
<p>You only need a code when the watch face displays a six-digit activation code on your Garmin screen. If no code appears, the watch face is already unlocked or still in a usable state.</p>
<h2>How to activate</h2>
<ol>
  <li>Open <a href="https://wristo.io/code">wristo.io/code</a>.</li>
  <li>Enter the email address used for checkout.</li>
  <li>Enter the six-digit code shown on the watch.</li>
  <li>Complete the checkout or unlock flow.</li>
  <li>Open Garmin Connect and sync the watch. The watch face usually refreshes within a few minutes.</li>
</ol>
<h2>If it does not refresh</h2>
<ul>
  <li>Keep Garmin Connect running and make sure Bluetooth is connected.</li>
  <li>Sync the watch manually, or sync the watch face again from Connect IQ App.</li>
  <li>If the network is unstable, switch between Wi-Fi and cellular data, then try again.</li>
  <li>If it still does not work after 5 minutes, contact support with the email, watch face name, and code shown on the watch.</li>
</ul>`,
    ),
    tr(
      'zh',
      'activation-code',
      '激活码与试用解锁',
      '手表出现 6 位激活码时，如何完成 Wristo 表盘激活。',
      `<h2>什么时候需要输入激活码？</h2>
<p>只有当 Garmin 手表表盘上显示 6 位激活码时，才需要进入激活流程。如果表盘没有显示代码，通常说明它已经可用，或还处于可试用状态。</p>
<h2>激活步骤</h2>
<ol>
  <li>打开 <a href="https://wristo.io/code">wristo.io/code</a>。</li>
  <li>输入你购买或准备购买时使用的邮箱。</li>
  <li>输入手表表盘上显示的 6 位数字代码。</li>
  <li>按页面提示完成支付或解锁。</li>
  <li>回到 Garmin Connect，保持手机和手表连接并同步。多数情况下几分钟内会刷新。</li>
</ol>
<h2>激活后没有刷新怎么办？</h2>
<ul>
  <li>确认 Garmin Connect 正在后台运行，蓝牙没有断开。</li>
  <li>手动同步一次手表，或在 Connect IQ App 里重新同步表盘。</li>
  <li>如果网络不稳定，切换 Wi-Fi/蜂窝网络后再试。</li>
  <li>等待 5 分钟后仍不生效，再联系支持，并提供邮箱、表盘名称和手表上的代码。</li>
</ul>`,
    ),
  ])),
  post(1002, 'purchase-refund-history', withSupportedFaqLocales([
    tr(
      'en',
      'purchase-refund-history',
      'Purchases, Duplicate Charges, Refunds, and History',
      'What to do after payment, duplicate prompts, refunds, or missing purchase records.',
      `<h2>I already bought Wristo Premium. Why do watch faces still ask for payment?</h2>
<p>Garmin privacy protection can prevent a watch face app from reading a stable unique device ID. Because of that, Wristo may not be able to activate the device automatically inside the watch face. Premium access is restored through the purchase email instead.</p>
<h2>Activate Premium with your purchase email</h2>
<ol>
  <li>Sign in on <a href="https://www.wristo.io/">wristo.io</a> with the email used for purchase.</li>
  <li>Open <a href="https://www.wristo.io/en/code">wristo.io/en/code</a>.</li>
  <li>Enter the six-digit code shown on your Garmin watch face and submit.</li>
  <li>Open Garmin Connect and sync the watch. The watch face should refresh after sync.</li>
</ol>
<h2>Activate without signing in</h2>
<ol>
  <li>Open <a href="https://www.wristo.io/already-purchased">wristo.io/already-purchased</a>.</li>
  <li>Enter the original purchase email.</li>
  <li>Enter the six-digit code currently shown on the watch face.</li>
  <li>Submit, then sync Garmin Connect.</li>
</ol>
<h2>Is payment recurring?</h2>
<p>Wristo watch faces and apps sold as lifetime licenses are one-time payments. If a reinstalled watch face asks again, restore the license instead of paying again.</p>
<h2>Purchase history</h2>
<p>Use <a href="https://wristo.io/purchases-history">wristo.io/purchases-history</a> to view purchase records. Signed-in users can also open Purchases from the profile menu.</p>
<h2>Refunds</h2>
<p>Wristo offers a 14-day refund window for digital products. Email <a href="mailto:support@wristo.io">support@wristo.io</a> with the purchase email, order proof, and the reason for the request.</p>`,
    ),
    tr(
      'zh',
      'purchase-refund-history',
      '购买、重复收费、退款与购买记录',
      '已经付款、重复提示付款、查不到订单或想退款时的处理方式。',
      `<h2>已经购买 Wristo Premium，为什么表盘还提示付款？</h2>
<p>这是因为 Garmin 的隐私保护机制可能不允许表盘应用读取稳定的设备唯一 ID，所以 Wristo 无法总是在表盘内部直接识别并激活你的设备。你的权益会通过购买邮箱恢复。</p>
<h2>通过购买邮箱激活 Premium</h2>
<ol>
  <li>在 <a href="https://www.wristo.io/">wristo.io</a> 使用购买邮箱登录。</li>
  <li>打开 <a href="https://www.wristo.io/en/code">wristo.io/en/code</a>。</li>
  <li>输入 Garmin 手表表盘上显示的 6 位数字并提交。</li>
  <li>打开 Garmin Connect 同步手表，表盘通常会在同步后刷新。</li>
</ol>
<h2>未登录状态如何激活？</h2>
<ol>
  <li>打开 <a href="https://www.wristo.io/already-purchased">wristo.io/already-purchased</a>。</li>
  <li>输入原购买邮箱。</li>
  <li>输入当前手表表盘上显示的 6 位数字。</li>
  <li>提交后同步 Garmin Connect。</li>
</ol>
<h2>Wristo 是一次性付款还是订阅？</h2>
<p>作为终身授权出售的 Wristo 表盘和应用是一次性付款。重装后再次出现付款提示时，应优先恢复授权，而不是重新支付。</p>
<h2>如何查看购买记录？</h2>
<p>打开 <a href="https://wristo.io/purchases-history">wristo.io/purchases-history</a> 查询完整购买记录。已登录用户也可以点击右上角头像，在个人中心进入购买记录。</p>
<h2>如何申请退款？</h2>
<p>数字产品支持自购买日起 14 天内申请退款。请发送邮件到 <a href="mailto:support@wristo.io">support@wristo.io</a>，并附上购买邮箱、订单凭证和退款原因。</p>`,
    ),
  ])),
  post(1003, 'install-sync', withSupportedFaqLocales([
    tr(
      'en',
      'install-sync',
      'Install, Sync, and Remove Watch Faces',
      'How to install Wristo watch faces, keep sync stable, and stop trial messages.',
      `<h2>Install a watch face</h2>
<ol>
  <li>Open the watch face detail page on Wristo.</li>
  <li>Click Download to open Garmin Connect IQ.</li>
  <li>Install the watch face from Connect IQ.</li>
  <li>Keep Garmin Connect running until the watch finishes syncing.</li>
</ol>
<h2>If it does not appear on the watch</h2>
<ul>
  <li>Confirm that Bluetooth is connected between the phone and watch.</li>
  <li>Open Garmin Connect or Connect IQ and sync manually.</li>
  <li>Confirm that the current watch model supports the watch face.</li>
  <li>If installation just finished, wait 1-3 minutes before checking again.</li>
</ul>
<h2>Stop trial or payment messages</h2>
<p>If you do not want to use a paid watch face after the trial, remove it from Garmin Connect IQ or install another watch face on the watch.</p>
<h2>Remove a watch face</h2>
<p>Open Garmin Connect IQ, go to My Device, choose the installed watch face, and remove it. If the watch still shows it, sync again or switch to a built-in Garmin face first.</p>`,
    ),
    tr(
      'zh',
      'install-sync',
      '安装、同步与删除表盘',
      '如何安装 Wristo 表盘、保持同步稳定，以及停止试用到期提示。',
      `<h2>如何安装并试用表盘？</h2>
<ol>
  <li>在 Wristo 网站选择喜欢的表盘，进入详情页。</li>
  <li>点击 Download，会跳转到 Garmin Connect IQ。</li>
  <li>在 Connect IQ 中安装表盘。</li>
  <li>保持 Garmin Connect 运行，等待手机和手表完成同步。</li>
</ol>
<h2>安装后没有出现在手表上怎么办？</h2>
<ul>
  <li>确认手表和手机蓝牙连接正常。</li>
  <li>打开 Garmin Connect 或 Connect IQ，手动同步一次。</li>
  <li>确认当前手表型号支持该表盘。</li>
  <li>如果刚安装完成，等待 1-3 分钟再查看。</li>
</ul>
<h2>不想购买，如何停止提示？</h2>
<p>如果试用已到期但你不想购买，删除该付费表盘，或切换到其它表盘，付款提示就会停止。</p>
<h2>如何删除表盘？</h2>
<p>打开 Garmin Connect IQ，进入 My Device，选择已安装的表盘并删除。如果删除后手表仍显示旧表盘，先切换到 Garmin 原生表盘，再同步一次。</p>`,
    ),
  ])),
  post(1004, 'settings-data-units', withSupportedFaqLocales([
    tr(
      'en',
      'settings-data-units',
      'Time, Date, Data Fields, Units, and Weather',
      'How to adjust common display settings and understand missing units or weather values.',
      `<h2>12-hour and 24-hour time</h2>
<p>Change time format from the Garmin watch system settings: Clocks, Time, Time Format. Choose 12-hour for AM/PM meaning, or 24-hour for 00:00-23:59 format.</p>
<h2>Can I hide the leading zero in 12-hour time?</h2>
<p>If the watch face provides a Leading Zero setting, turn it off in Connect IQ watch face settings. When it is on, time displays like 08:30; when it is off, time displays like 8:30.</p>
<h2>Date format</h2>
<p>Use the date-format hint in the watch face settings. For example, a pattern like %y/%m/%d can display a numeric year/month/day style such as 2026/06/15. Supported patterns may vary by watch face.</p>
<h2>Why are data units missing?</h2>
<p>Some data fields show units only when ShowUnit is enabled and the total field length remains readable. This avoids text overflow on smaller screens and keeps time and key data legible.</p>
<h2>Why are temperature or weather values blank?</h2>
<ul>
  <li>Outdoor weather usually depends on Garmin's built-in weather support; unsupported devices or regions may show --.</li>
  <li>Sensor temperature depends on watch hardware. Devices without a temperature sensor cannot show it.</li>
  <li>Celsius/Fahrenheit units are usually set from the watch system Settings / Format / Units / Temperature.</li>
</ul>`,
    ),
    tr(
      'zh',
      'settings-data-units',
      '时间、日期、数据字段、单位与天气',
      '常见显示设置如何调整，以及单位、天气、温度为空时该怎么判断。',
      `<h2>如何切换 12 小时制和 24 小时制？</h2>
<p>通常在手表系统设置中调整：Clocks / Time / Time Format。选择 12-hour 会显示 AM/PM 语义，选择 24-hour 会显示 00:00-23:59 格式。</p>
<h2>12 小时制前面的 0 可以隐藏吗？</h2>
<p>如果表盘提供 Leading Zero 设置，可以在 Connect IQ 的表盘设置里关闭。开启时显示 08:30，关闭后显示 8:30。</p>
<h2>日期格式怎么改？</h2>
<p>在表盘设置里按提示填写日期格式。例如想显示 2026/06/15，可使用类似 %y/%m/%d 的格式。不同表盘支持的格式可能略有差异。</p>
<h2>为什么数据单位没有显示？</h2>
<p>部分数据字段只有在开启 ShowUnit 且字段总长度不影响显示时才显示单位。这样可以避免小屏幕上文字溢出，保证时间和关键数据可读。</p>
<h2>温度和天气为什么显示为空？</h2>
<ul>
  <li>天气预报通常依赖 Garmin 内置天气能力，设备或地区不支持时可能显示 --。</li>
  <li>传感器温度依赖手表硬件，没有温度传感器的设备无法显示。</li>
  <li>摄氏/华氏单位一般在手表系统 Settings / Format / Units / Temperature 中设置。</li>
</ul>`,
    ),
  ])),
  post(1005, 'iq-error-troubleshooting', withSupportedFaqLocales([
    tr(
      'en',
      'iq-error-troubleshooting',
      'IQ Error Troubleshooting',
      'What to do when a Garmin watch face shows IQ or crashes.',
      `<h2>First checks</h2>
<ol>
  <li>Switch to a built-in Garmin watch face.</li>
  <li>Update Garmin firmware, Garmin Connect, and Connect IQ.</li>
  <li>Remove and reinstall the Wristo watch face.</li>
  <li>Sync again while Bluetooth is stable.</li>
</ol>
<h2>Common causes</h2>
<ul>
  <li>A firmware update temporarily makes the old watch face version incompatible.</li>
  <li>Bluetooth was interrupted during installation or update, so sync did not finish.</li>
  <li>The watch is low on available memory and cannot load a complex watch face.</li>
</ul>
<h2>Send logs</h2>
<p>If the IQ error continues, connect the Garmin watch to a computer and check <code>/Garmin/Apps/Logs/</code> for <code>CIQ_LOG.bak</code> or similar log files. Email the log, device model, firmware version, watch face name, and a short description to <a href="mailto:support@wristo.io">support@wristo.io</a>.</p>`,
    ),
    tr(
      'zh',
      'iq-error-troubleshooting',
      'IQ 错误与崩溃排查',
      'Garmin 表盘显示 IQ 或闪退时，按这个顺序排查。',
      `<h2>先做这几步</h2>
<ol>
  <li>先切换回 Garmin 系统原生表盘，确认手表本身运行正常。</li>
  <li>更新手表固件、Garmin Connect 和 Connect IQ App。</li>
  <li>删除出问题的 Wristo 表盘后重新安装。</li>
  <li>保持蓝牙连接稳定，再手动同步一次。</li>
</ol>
<h2>常见原因</h2>
<ul>
  <li>手表固件升级后，旧版本表盘暂时不兼容。</li>
  <li>安装或更新过程中蓝牙中断，导致同步不完整。</li>
  <li>设备内存紧张，复杂表盘加载失败。</li>
</ul>
<h2>仍然无效时发送日志</h2>
<p>把 Garmin 手表连接电脑，进入 <code>/Garmin/Apps/Logs/</code>，查找 <code>CIQ_LOG.bak</code> 或其它 <code>.log</code> / <code>.bak</code> 文件。发送邮件到 <a href="mailto:support@wristo.io">support@wristo.io</a>，并附上手表型号、系统版本、表盘名称、问题截图和日志文件。</p>`,
    ),
  ])),
] satisfies BlogPostVO[]

export const faqGuidePosts = [
  ...curatedFaqGuidePosts,
  ...legacyFaqGuidePosts,
] satisfies BlogPostVO[]

const faqFunctionalGroups = [
  {
    title: 'Choose and install',
    anchor: 'choose-and-install',
    slugs: [
      'select-device-guide-en',
      'use-install-guide-en',
      'install-sync',
      'remove-watch-face-en',
    ],
  },
  {
    title: 'Activation and purchases',
    anchor: 'activation-and-purchases',
    slugs: [
      'activation-code',
      'how-to-activate-your-wristo-watch-face',
      'faq-activate-whole-plan',
      'purchase-refund-history',
    ],
  },
  {
    title: 'Settings and display',
    anchor: 'settings-and-display',
    slugs: [
      'settings-data-units',
      'how-to-customize-garmin-watch-face-colors',
      'why-do-different-garmin-watches-display-colors-differently',
      'garmin-heart-rate-en',
    ],
  },
  {
    title: 'Sync and troubleshooting',
    anchor: 'sync-and-troubleshooting',
    slugs: [
      'how-to-keep-garmin-watch-connected-to-connect-iq',
      'keep-garmin-connect-running-in-background-iphone',
      'iq-error-troubleshooting',
    ],
  },
]

const faqFunctionalGroupNodes = faqFunctionalGroups.map((group, groupIndex) => {
  const id = 2000 + groupIndex
  return {
    id,
    postId: null,
    parentId: null,
    title: group.title,
    anchor: group.anchor,
    orderIndex: groupIndex + 2,
    depth: 0,
    linkUrl: null,
    isActive: 1,
    createdAt: now,
    updatedAt: now,
    post: null,
    children: group.slugs.flatMap((slug, postIndex) => {
      const item = findFaqPostByAnySlug(slug)
      if (!item) return []
      return [createPostNode({
        id: 2100 + groupIndex * 100 + postIndex,
        post: item,
        parentId: id,
        orderIndex: postIndex + 1,
      })]
    }),
  }
}).filter((group) => group.children.length > 0)

export const faqGuideTocTree: BlogPostTocItemVO[] = [
  {
    id: 1000,
    postId: 1000,
    parentId: null,
    title: 'FAQ',
    anchor: 'faq',
    orderIndex: 1,
    depth: 0,
    linkUrl: '/zh/faq/faq',
    isActive: 1,
    createdAt: now,
    updatedAt: now,
    post: curatedFaqGuidePosts[0],
    children: [],
  },
  ...faqFunctionalGroupNodes,
]

function createPostNode({
  id,
  post,
  parentId,
  orderIndex,
}: {
  id: number
  post: BlogPostVO
  parentId: number
  orderIndex: number
}): BlogPostTocItemVO {
  return {
    id,
    postId: post.id,
    parentId,
    title: post.translations.find((translation) => translation.lang === 'zh')?.title || post.title || post.slug,
    anchor: post.slug,
    orderIndex,
    depth: 1,
    linkUrl: `/zh/faq/${post.slug}`,
    isActive: 1,
    createdAt: post.createdAt || now,
    updatedAt: post.updatedAt || now,
    post,
    children: [],
  }
}

function findFaqPostByAnySlug(slug: string): BlogPostVO | null {
  return faqGuidePosts.find((item) =>
    item.slug === slug ||
    item.translations?.some((translation) => translation.slug === slug),
  ) || null
}

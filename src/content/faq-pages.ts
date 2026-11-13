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
    url: `/${lang}/support/${slug}`,
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
  <li><strong>You already paid but see a payment prompt:</strong> sign in on <a href="https://www.wristo.io/">wristo.io</a> with the purchase email, then open <a href="https://www.wristo.io/en/code">wristo.io/en/code</a>. You can also use <a href="https://www.wristo.io/activate">Activate your purchase</a> without signing in by entering the purchase email and the six-digit code shown on the watch.</li>
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
  <li><strong>已经付费但又提示付款：</strong>先用购买邮箱登录 <a href="https://www.wristo.io/">wristo.io</a>，再打开 <a href="https://www.wristo.io/en/code">wristo.io/en/code</a> 激活；也可以在未登录状态打开 <a href="https://www.wristo.io/activate">Activate your purchase</a>，输入购买邮箱和手表上的 6 位数字恢复授权。</li>
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
  post(1006, 'find-watch-faces-after-bundle-purchase', withSupportedFaqLocales([
    tr(
      'en',
      'find-watch-faces-after-bundle-purchase',
      'Where Can I Find the Watch Faces Included in My Bundle?',
      'How to browse, install, and activate watch faces after purchasing a Wristo bundle.',
      `<h2>Where are the other watch faces?</h2>
<p>A Wristo bundle provides activation access. The included watch faces are not sent individually by email.</p>
<p>You can <a href="https://www.wristo.io/categories/whole">browse all available watch faces</a> or <a href="https://www.wristo.io/search">search for a specific watch face</a> on Wristo.io.</p>
<h2>Which apps can I activate?</h2>
<ul>
  <li>All apps listed on <a href="https://www.wristo.io/">Wristo.io</a>.</li>
  <li>Apps in the Garmin Connect IQ Store whose descriptions mention <strong>Wristo.io</strong>.</li>
</ul>
<h2>How do I use a watch face from the bundle?</h2>
<ol>
  <li>Choose a watch face on Wristo.io or in the Garmin Connect IQ Store.</li>
  <li>Download and install it from the Garmin Connect IQ Store.</li>
  <li>When the watch face displays a six-digit activation code, activate it using the email address from your bundle purchase.</li>
</ol>
<p>If a particular watch face cannot be activated, contact <a href="mailto:support@wristo.io">support@wristo.io</a> and include its name or Garmin Connect IQ link.</p>`,
    ),
    tr(
      'zh',
      'find-watch-faces-after-bundle-purchase',
      '购买套装后，在哪里找到包含的表盘？',
      '购买 Wristo 套装后，如何查找、安装和激活其中的表盘。',
      `<h2>其他表盘在哪里？</h2>
<p>Wristo 套装提供的是表盘激活权益，套装内的表盘不会逐个通过邮件发送。</p>
<p>你可以在 Wristo.io <a href="https://www.wristo.io/categories/whole">查看所有可用表盘</a>，也可以<a href="https://www.wristo.io/search">搜索指定表盘</a>。</p>
<h2>哪些应用可以激活？</h2>
<ul>
  <li><a href="https://www.wristo.io/">Wristo.io</a> 网站上的所有应用。</li>
  <li>Garmin Connect IQ 商店中，应用说明里包含 <strong>Wristo.io</strong> 的应用。</li>
</ul>
<h2>如何使用套装中的表盘？</h2>
<ol>
  <li>在 Wristo.io 或 Garmin Connect IQ 商店中选择表盘。</li>
  <li>从 Garmin Connect IQ 商店下载并安装表盘。</li>
  <li>当表盘显示 6 位激活码时，使用购买套装时填写的邮箱完成激活。</li>
</ol>
<p>如果某个表盘无法激活，请联系 <a href="mailto:support@wristo.io">support@wristo.io</a>，并提供表盘名称或 Garmin Connect IQ 链接。</p>`,
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
  <li>Open <a href="https://www.wristo.io/activate">wristo.io/activate</a>.</li>
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
  <li>打开 <a href="https://www.wristo.io/activate">wristo.io/activate</a>。</li>
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
  {
    ...post(1010, 'bluetooth-online-data-sync', withSupportedFaqLocales([
      tr('zh', 'bluetooth-online-data-sync',
        '佳明表盘联网数据不显示？看懂蓝牙状态与「最多 5 分钟同步」',
        '农历、干支年、生肖年等数据为什么需要联网？结合实拍与设置截图，了解蓝牙断开后的影响和同步排查方法。',
        `<p>设置里已经选了农历日期，表盘上却迟迟没有显示？先看看手表与手机是否保持连接，以及这个数据项是否标注了「🌐 联网请求」。</p>
<p>Wristo 的部分数据项需要通过手机获取网络数据。设置中的「最多 5 分钟同步」说的是这些数据项的同步等待时间，不是只展示 5 分钟，也不是蓝牙断开后等 5 分钟就会自动恢复。</p>
<h2>先看手表上的蓝牙状态</h2>
<figure><a href="/images/guides/bluetooth-online-data/watch-disconnected.jpg" target="_blank" rel="noopener noreferrer"><img src="/images/guides/bluetooth-online-data/watch-disconnected.jpg" alt="佳明手表实拍：11:25 时间左侧的蓝牙图标带斜线，表示连接已断开" width="810" height="1440" loading="lazy" style="width:100%;max-width:405px;height:auto" /></a><figcaption>实拍中，时间左侧带斜线的蓝牙图标表示连接已断开。点击图片可查看原图。</figcaption></figure>
<p>对于依赖手机联网的表盘功能，蓝牙断开意味着联网通道暂时中断。手机即使正在使用 Wi-Fi 或移动网络，也无法通过已经断开的连接把新数据传回手表。</p>
<p>图片中的「--」需要结合具体字段判断，不能仅凭占位符认定某项数据的故障原因。蓝牙状态是排查连接的线索。</p>
<h2>手表怎样通过手机联网？</h2>
<p><strong>手表发起请求 → 通过蓝牙传给手机 → 手机访问网络服务 → 数据经手机返回手表。</strong></p>
<p>在这种使用场景中，手机承担了手表与互联网之间的桥梁作用。Garmin Connect IQ 的 <a href="https://developer.garmin.com/connect-iq/api-docs/Toybox/Communications.html" target="_blank" rel="noopener noreferrer">官方通信文档</a>也说明了通过低功耗蓝牙连接手机、由手机连接互联网的机制。</p>
<p>因此，这里说的「设备离线」，具体指依赖手机的联网功能暂时不可用。手表计时、步数和本地传感器数据通常仍可继续工作。本文不把这种情况推广为所有佳明机型、所有联网方式的统一限制。</p>
<h2>哪些数据项需要联网？看设置里的标注</h2>
<figure><a href="/images/guides/bluetooth-online-data/online-data-settings.jpg" target="_blank" rel="noopener noreferrer"><img src="/images/guides/bluetooth-online-data/online-data-settings.jpg" alt="Wristo 应用设置截图：农历日期、干支年、生肖年、节日节气、黄历宜忌和黄历不宜均标注联网请求，最多 5 分钟同步" width="1206" height="2622" loading="lazy" style="width:100%;max-width:480px;height:auto" /></a><figcaption>应用设置中的「🌐 联网请求，最多 5 分钟同步」提示。点击图片可放大查看。</figcaption></figure>
<p>以这张设置截图为例，标注需要联网的数据项包括：</p>
<ul><li>农历日期，例如五月十五、七月初六。</li><li>干支年，例如甲子年、乙丑年。</li><li>生肖年，例如鼠年、牛年。</li><li>节日节气，例如春节、清明节。</li><li>黄历宜忌、黄历不宜等内容。</li></ul>
<p>这些内容在当前应用中通过联网请求取得。判断某个选项是否需要联网，应以该应用设置里的标注为准；并不是所有日期信息都需要网络。</p>
<h2>「最多 5 分钟同步」应该怎样理解？</h2>
<p>选择并保存这些联网数据项后，需要给数据同步留出时间。<strong>在手机与手表连接正常、手机网络可用的前提下，按设置提示等待最多约 5 分钟，再查看表盘。</strong></p>
<p>这个提示不是断网情况下的成功保证，也不表示所有数据都每 5 分钟刷新一次。若蓝牙断开、手机没有网络，或后台通信受到限制，单纯等待 5 分钟不能解决连接问题。</p>
<p>恢复连接后，数据也不一定立刻出现，需要等后续请求成功。获取失败时，不同表盘可能显示空白、「--」，或保留上一次取得的内容。有数值不代表刚刚更新过。</p>
<h2>数据没有出现，按这个顺序检查</h2>
<ol><li><strong>确认选项并保存：</strong>在应用设置中查看该字段是否标注「联网请求」，选择需要的数据项后点击保存。</li><li><strong>确认设备连接：</strong>将手机放在手表附近，打开 Garmin Connect，检查设备是否显示已连接。仅打开手机蓝牙开关不等于设备已连接。</li><li><strong>确认手机网络：</strong>检查手机的 Wi-Fi 或移动网络能否正常访问互联网。</li><li><strong>检查后台限制：</strong>确认 Garmin Connect 没有被强制关闭或受到后台、省电设置限制。</li><li><strong>连接正常后再等待：</strong>按照设置中的同步提示留出约 5 分钟，随后检查表盘中的相应字段。</li></ol>
<p>Garmin 官方的<a href="https://support.garmin.com/en-US/?faq=Mxs4eRXzRdAYJ0h7yyWaj9" target="_blank" rel="noopener noreferrer">天气数据排查说明</a>也建议先确认 Garmin Connect 中的设备连接状态。该资料说明通用的连接排查方法；本文中的 5 分钟提示来自 Wristo 应用设置。</p>
<h2>仍未恢复时，反馈哪些信息？</h2>
<p>如果连接和网络都正常，等待后仍没有数据，请提供表盘名称、手表型号、选中的数据项、表盘照片及应用设置截图，并说明 Garmin Connect 是否显示已连接。可以通过 <a href="mailto:support@wristo.io">support@wristo.io</a> 联系我们。</p>
<p>排查时先区分两件事：设置是否已保存到设备，以及联网数据是否已成功获取。这样更容易找到问题发生在哪一步。</p>`),
    ])),
    publishedAt: '2026-11-13T03:40:00.000Z',
    createdAt: '2026-11-13T03:40:00.000Z',
    updatedAt: '2026-11-13T03:40:00.000Z',
    coverImageUrl: '/images/guides/bluetooth-online-data/cover.png',
  },
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
      'find-watch-faces-after-bundle-purchase',
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
      'bluetooth-online-data-sync',
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
    linkUrl: '/zh/support/faq',
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
    linkUrl: `/zh/support/${post.slug}`,
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

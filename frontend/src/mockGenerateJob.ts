import type { Article, JobGenerationConfig } from './types'
import { JOB_LOCATIONS } from './types'

/**
 * Sinh tin TUYỂN DỤNG (đăng lên Sapo dưới dạng bài viết blog) cho ngành Thiết kế - Thi công nội thất.
 *
 * Tag theo quy ước để theme đọc ra thông tin tuyển dụng:
 *   loc:<Địa điểm>  type:<Hình thức>  salary:<Lương>  exp:<Kinh nghiệm>  qty:<Số lượng>  deadline:<Hạn nộp dd/mm/yyyy>
 * Giá trị tag không được chứa dấu phẩy (Sapo tách tag theo dấu phẩy).
 */

interface JobRole {
  title: string
  type: 'Toàn thời gian' | 'Bán thời gian' | 'Thực tập'
  salary: string
  exp: string
  qty: [number, number]
  imageKeyword: string
  summary: string
  duties: string[]
  requirements: string[]
}

const JOB_ROLES: JobRole[] = [
  {
    title: 'Kiến trúc sư thiết kế nội thất',
    type: 'Toàn thời gian',
    salary: '15 - 25 triệu',
    exp: '2 năm',
    qty: [1, 2],
    imageKeyword: 'interior designer working',
    summary: 'lên ý tưởng và phát triển phương án thiết kế nội thất nhà phố, căn hộ, biệt thự cho khách hàng',
    duties: [
      'Gặp gỡ, khảo sát hiện trạng và trao đổi nhu cầu cùng chủ đầu tư.',
      'Lên concept, mặt bằng bố trí và phương án vật liệu cho từng không gian.',
      'Phối hợp với họa viên 3D và bộ phận triển khai để hoàn thiện hồ sơ thiết kế.',
      'Giám sát tác giả trong quá trình thi công, đảm bảo công trình đúng thiết kế.',
    ],
    requirements: [
      'Tốt nghiệp Kiến trúc, Thiết kế nội thất hoặc chuyên ngành liên quan.',
      'Sử dụng thành thạo AutoCAD, SketchUp; biết 3ds Max là lợi thế.',
      'Có portfolio các công trình nhà ở đã thực hiện.',
      'Giao tiếp tốt, chủ động lắng nghe và thuyết phục khách hàng.',
    ],
  },
  {
    title: 'Họa viên diễn họa 3D nội thất',
    type: 'Toàn thời gian',
    salary: '12 - 20 triệu',
    exp: '1 năm',
    qty: [2, 3],
    imageKeyword: 'designer computer 3d rendering',
    summary: 'dựng hình và diễn họa phối cảnh 3D chân thực cho các phương án thiết kế nội thất',
    duties: [
      'Dựng model 3D từ bản vẽ mặt bằng và concept của kiến trúc sư.',
      'Diễn họa phối cảnh, ánh sáng, vật liệu sát với thực tế thi công.',
      'Chỉnh sửa phương án theo góp ý của khách hàng trong thời gian ngắn.',
    ],
    requirements: [
      'Thành thạo 3ds Max kết hợp Corona hoặc V-Ray, Photoshop.',
      'Có thẩm mỹ tốt về màu sắc, ánh sáng và bố cục.',
      'Gửi kèm portfolio các phối cảnh đã thực hiện.',
    ],
  },
  {
    title: 'Kỹ sư giám sát thi công nội thất',
    type: 'Toàn thời gian',
    salary: '14 - 22 triệu',
    exp: '2 năm',
    qty: [2, 3],
    imageKeyword: 'construction supervisor interior site',
    summary: 'giám sát tiến độ, chất lượng và an toàn tại các công trình thi công nội thất',
    duties: [
      'Lập và theo dõi tiến độ thi công từng hạng mục tại công trình.',
      'Kiểm tra chất lượng vật tư, đồ gỗ trước khi lắp đặt.',
      'Điều phối đội thợ, xử lý phát sinh tại hiện trường.',
      'Nghiệm thu từng giai đoạn và bàn giao công trình cho chủ đầu tư.',
    ],
    requirements: [
      'Tốt nghiệp Xây dựng, Kiến trúc hoặc Nội thất.',
      'Đọc hiểu tốt bản vẽ thiết kế và bản vẽ triển khai.',
      'Chịu được áp lực tiến độ, sẵn sàng di chuyển giữa các công trình.',
    ],
  },
  {
    title: 'Chỉ huy trưởng công trình nội thất',
    type: 'Toàn thời gian',
    salary: '25 - 35 triệu',
    exp: '5 năm',
    qty: [1, 1],
    imageKeyword: 'construction manager blueprint',
    summary: 'quản lý toàn bộ dự án thi công nội thất từ lúc khởi công tới khi bàn giao',
    duties: [
      'Lập kế hoạch tổng thể, phân bổ nhân lực và vật tư cho dự án.',
      'Làm việc trực tiếp với chủ đầu tư, tư vấn giám sát về tiến độ và chất lượng.',
      'Kiểm soát chi phí, hạn chế phát sinh ngoài dự toán.',
      'Quản lý đội ngũ kỹ sư giám sát và các tổ đội thi công.',
    ],
    requirements: [
      'Đã từng chỉ huy công trình nội thất căn hộ cao cấp, biệt thự hoặc showroom.',
      'Kỹ năng quản lý dự án, đàm phán và giải quyết vấn đề tốt.',
      'Ưu tiên ứng viên có chứng chỉ chỉ huy trưởng.',
    ],
  },
  {
    title: 'Nhân viên kinh doanh dự án nội thất',
    type: 'Toàn thời gian',
    salary: '10 - 30 triệu',
    exp: 'Không yêu cầu',
    qty: [3, 5],
    imageKeyword: 'sales consultant meeting client',
    summary: 'tìm kiếm, tư vấn và chốt hợp đồng thiết kế - thi công nội thất với khách hàng',
    duties: [
      'Tiếp nhận khách hàng từ marketing, tư vấn gói thiết kế và thi công phù hợp.',
      'Đưa khách tham quan công trình mẫu, showroom.',
      'Phối hợp với kiến trúc sư lập báo giá và theo dõi tới khi ký hợp đồng.',
      'Chăm sóc khách hàng sau bàn giao để có thêm khách giới thiệu.',
    ],
    requirements: [
      'Yêu thích lĩnh vực nội thất, giao tiếp tự tin.',
      'Chưa có kinh nghiệm sẽ được đào tạo bài bản về sản phẩm và quy trình.',
      'Có xe máy, sẵn sàng gặp khách tại công trình.',
    ],
  },
  {
    title: 'Chuyên viên dự toán nội thất',
    type: 'Toàn thời gian',
    salary: '13 - 20 triệu',
    exp: '2 năm',
    qty: [1, 2],
    imageKeyword: 'accountant calculating documents',
    summary: 'bóc tách khối lượng và lập dự toán, báo giá cho các hạng mục nội thất',
    duties: [
      'Bóc tách khối lượng đồ gỗ, vật liệu hoàn thiện từ bản vẽ.',
      'Lập dự toán, báo giá và so sánh phương án vật liệu cho khách hàng.',
      'Cập nhật đơn giá vật tư, nhân công theo thị trường.',
      'Quyết toán khối lượng khi công trình hoàn thành.',
    ],
    requirements: [
      'Thành thạo Excel, đọc hiểu bản vẽ AutoCAD.',
      'Hiểu biết về gỗ công nghiệp, gỗ tự nhiên, phụ kiện nội thất.',
      'Cẩn thận, chính xác với số liệu.',
    ],
  },
  {
    title: 'Kỹ thuật viên triển khai bản vẽ sản xuất',
    type: 'Toàn thời gian',
    salary: '12 - 18 triệu',
    exp: '1 năm',
    qty: [1, 2],
    imageKeyword: 'architect drawing technical plans',
    summary: 'triển khai bản vẽ kỹ thuật chi tiết (shop drawing) cho xưởng sản xuất đồ gỗ',
    duties: [
      'Triển khai bản vẽ chi tiết tủ bếp, tủ áo, vách ốp từ thiết kế đã duyệt.',
      'Bóc tách vật tư, phụ kiện gửi xưởng sản xuất.',
      'Phối hợp với xưởng xử lý vướng mắc kỹ thuật.',
    ],
    requirements: [
      'Thành thạo AutoCAD; biết phần mềm tách ván là lợi thế.',
      'Nắm vững cấu tạo đồ nội thất gỗ công nghiệp.',
    ],
  },
  {
    title: 'Quản lý xưởng sản xuất đồ gỗ nội thất',
    type: 'Toàn thời gian',
    salary: '20 - 30 triệu',
    exp: '4 năm',
    qty: [1, 1],
    imageKeyword: 'woodworking workshop',
    summary: 'điều hành xưởng sản xuất đồ gỗ, đảm bảo tiến độ và chất lượng cho các công trình',
    duties: [
      'Lập kế hoạch sản xuất theo tiến độ từng công trình.',
      'Quản lý máy móc, nhân sự và vật tư trong xưởng.',
      'Kiểm soát chất lượng thành phẩm trước khi xuất xưởng.',
      'Đề xuất cải tiến quy trình giảm hao hụt vật tư.',
    ],
    requirements: [
      'Từng quản lý xưởng gỗ công nghiệp hoặc gỗ tự nhiên.',
      'Hiểu rõ máy CNC, máy dán cạnh, quy trình sơn hoàn thiện.',
      'Kỹ năng quản lý đội nhóm tốt.',
    ],
  },
  {
    title: 'Thợ mộc lắp đặt nội thất',
    type: 'Toàn thời gian',
    salary: '10 - 15 triệu',
    exp: '1 năm',
    qty: [3, 5],
    imageKeyword: 'carpenter installing cabinet',
    summary: 'lắp đặt đồ gỗ nội thất tại công trình đúng bản vẽ và tiêu chuẩn hoàn thiện',
    duties: [
      'Vận chuyển, lắp đặt tủ bếp, tủ áo, giường, vách ốp tại công trình.',
      'Căn chỉnh, hoàn thiện mối nối, phụ kiện bản lề, ray trượt.',
      'Giữ vệ sinh công trình sau khi lắp đặt.',
    ],
    requirements: [
      'Biết đọc bản vẽ cơ bản, sử dụng thành thạo dụng cụ cầm tay.',
      'Chăm chỉ, cẩn thận, có trách nhiệm với sản phẩm.',
      'Được đào tạo thêm nếu còn ít kinh nghiệm.',
    ],
  },
  {
    title: 'Thợ sơn PU đồ gỗ',
    type: 'Toàn thời gian',
    salary: '10 - 16 triệu',
    exp: '2 năm',
    qty: [2, 3],
    imageKeyword: 'spray painting wood furniture',
    summary: 'xử lý bề mặt và sơn hoàn thiện PU cho đồ gỗ nội thất tại xưởng',
    duties: [
      'Chà nhám, xử lý bề mặt gỗ trước khi sơn.',
      'Pha màu, phun sơn lót và sơn phủ PU theo mẫu.',
      'Kiểm tra độ bóng, độ đều màu của thành phẩm.',
    ],
    requirements: [
      'Thành thạo kỹ thuật phun sơn PU, pha màu theo mẫu.',
      'Có sức khỏe tốt, tuân thủ quy định an toàn xưởng.',
    ],
  },
  {
    title: 'Nhân viên thu mua vật tư nội thất',
    type: 'Toàn thời gian',
    salary: '10 - 15 triệu',
    exp: '1 năm',
    qty: [1, 1],
    imageKeyword: 'warehouse materials inventory',
    summary: 'tìm nguồn và mua vật tư, phụ kiện nội thất đúng chất lượng, đúng tiến độ',
    duties: [
      'Tìm kiếm, đánh giá và đàm phán với nhà cung cấp ván, đá, phụ kiện.',
      'Đặt hàng theo đề xuất của bộ phận sản xuất và công trình.',
      'Theo dõi giao nhận, đối chiếu chứng từ thanh toán.',
    ],
    requirements: [
      'Kỹ năng đàm phán, quản lý nhà cung cấp.',
      'Ưu tiên ứng viên từng làm thu mua ngành gỗ, xây dựng.',
    ],
  },
  {
    title: 'Thực tập sinh thiết kế nội thất',
    type: 'Thực tập',
    salary: '3 - 5 triệu',
    exp: 'Không yêu cầu',
    qty: [2, 4],
    imageKeyword: 'young designer sketching interior',
    summary: 'học việc cùng đội ngũ kiến trúc sư trên các dự án nội thất thực tế',
    duties: [
      'Hỗ trợ dựng mặt bằng, bản vẽ triển khai và mood board vật liệu.',
      'Tham gia khảo sát công trình cùng kiến trúc sư.',
      'Được hướng dẫn trực tiếp quy trình từ thiết kế tới thi công.',
    ],
    requirements: [
      'Sinh viên năm cuối hoặc mới tốt nghiệp Kiến trúc, Thiết kế nội thất.',
      'Biết AutoCAD, SketchUp cơ bản; ham học hỏi.',
      'Có thể làm tối thiểu 4 ngày mỗi tuần.',
    ],
  },
]

const BENEFITS = [
  'Lương tháng 13 và thưởng theo hiệu quả dự án.',
  'Đóng BHXH, BHYT, BHTN đầy đủ theo quy định.',
  'Du lịch, team building hằng năm; khám sức khỏe định kỳ.',
  'Môi trường trẻ trung, được tham gia các dự án nội thất cao cấp.',
  'Lộ trình thăng tiến rõ ràng, đào tạo nâng cao chuyên môn.',
  'Phụ cấp ăn trưa, xăng xe và điện thoại.',
]

/** Khu vực cụ thể (bỏ "Tự động") — xoay vòng khi người dùng chọn "Tự động". */
const AUTO_LOCATIONS = JOB_LOCATIONS.filter((l) => l !== 'Tự động')

/** 'YYYY-MM-DD' → 'dd/mm/yyyy' (định dạng hạn nộp hiển thị trong tag/nội dung). */
export function formatDeadline(isoDate: string): string {
  const [y, m, d] = isoDate.split('-')
  return y && m && d ? `${d}/${m}/${y}` : isoDate
}

/** Hạn nộp mặc định: 30 ngày kể từ hôm nay, dạng 'YYYY-MM-DD' cho ô chọn ngày. */
export function defaultJobDeadline(): string {
  const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Bỏ dấu phẩy khỏi giá trị tag — Sapo tách tag theo dấu phẩy. */
function tagValue(v: string): string {
  return v.replace(/,/g, ' ').replace(/\s+/g, ' ').trim()
}

function infoRow(label: string, value: string): string {
  return `<tr><td style="padding:8px 12px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:600;width:35%;">${label}</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${value}</td></tr>`
}

/** Sinh 1 tin tuyển dụng thứ `index` — mỗi vị trí 1 tin, đủ 12 vị trí khác nhau trước khi lặp lại. */
export function generateMockJob(index: number, config: JobGenerationConfig): Article {
  const role = JOB_ROLES[index % JOB_ROLES.length]
  const round = Math.floor(index / JOB_ROLES.length)
  const location = config.location === 'Tự động' ? AUTO_LOCATIONS[(index + round) % AUTO_LOCATIONS.length] : config.location
  const qty = role.qty[0] + ((index * 7 + round) % (role.qty[1] - role.qty[0] + 1))
  const deadline = formatDeadline(config.deadline)
  const benefits = [0, 1, 2, 3, 4, 5].filter((i) => (i + index) % 3 !== 0).map((i) => BENEFITS[i])
  const title = `Tuyển dụng ${role.title} tại ${location}${round > 0 ? ` (đợt ${round + 1})` : ''}`

  const content = [
    `<p>Chúng tôi là đơn vị chuyên <strong>thiết kế và thi công nội thất trọn gói</strong> cho căn hộ, nhà phố, biệt thự và showroom. Để đáp ứng số lượng dự án ngày càng tăng, chúng tôi cần tuyển <strong>${qty} ${role.title}</strong> ${role.summary}.</p>`,
    `<h2>Thông tin tuyển dụng</h2>`,
    `<table style="width:100%;border-collapse:collapse;">${[
      infoRow('Địa điểm làm việc', location),
      infoRow('Hình thức', role.type),
      infoRow('Mức lương', `${role.salary} VNĐ/tháng`),
      infoRow('Kinh nghiệm', role.exp),
      infoRow('Số lượng', `${qty} người`),
      infoRow('Hạn nộp hồ sơ', deadline),
    ].join('')}</table>`,
    `<h2>Mô tả công việc</h2><ul>${role.duties.map((d) => `<li>${d}</li>`).join('')}</ul>`,
    `<h2>Yêu cầu ứng viên</h2><ul>${role.requirements.map((r) => `<li>${r}</li>`).join('')}</ul>`,
    `<h2>Quyền lợi</h2><ul>${benefits.map((b) => `<li>${b}</li>`).join('')}</ul>`,
    `<h2>Cách ứng tuyển</h2><p>Gửi CV (kèm portfolio nếu có) trước ngày <strong>${deadline}</strong> với tiêu đề: <em>"Ứng tuyển ${role.title} - Họ tên"</em>. Chúng tôi sẽ liên hệ hẹn lịch phỏng vấn với hồ sơ phù hợp.</p>`,
  ].join('\n')

  const userTags = config.tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  return {
    id: `draft-job-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    kind: 'job',
    title,
    author: 'Phòng Nhân sự',
    imageKeyword: role.imageKeyword,
    excerpt: `Tuyển ${qty} ${role.title} tại ${location} — ${role.type.toLowerCase()}, lương ${role.salary}, kinh nghiệm: ${role.exp.toLowerCase()}. Hạn nộp hồ sơ: ${deadline}.`,
    content,
    tags: [
      ...new Set([
        `loc:${tagValue(location)}`,
        `type:${tagValue(role.type)}`,
        `salary:${tagValue(role.salary)}`,
        `exp:${tagValue(role.exp)}`,
        `qty:${qty}`,
        `deadline:${deadline}`,
        ...userTags,
      ]),
    ],
    blog: config.blogName.trim() || 'Tuyển dụng',
    seoTitle: `${title} | Lương ${role.salary}`,
    seoDescription: `Tuyển ${qty} ${role.title} tại ${location}, lương ${role.salary}, hạn nộp ${deadline}. Ứng tuyển ngay!`,
    status: 'draft',
  }
}

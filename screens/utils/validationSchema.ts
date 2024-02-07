import * as yup from 'yup';

export const customersValidationSchema = yup.object().shape({
  id: yup.string(),
  name: yup.string().required('ระบุชื่อลูกค้า'),
  address: yup.string().required('ระบุที่อยู่ลูกค้า'),
  companyId: yup.string(),
  phone: yup.string(),
});
export const companyValidationSchema = yup.object().shape({
  bizName: yup.string().required('ระบุชื่อธุรกิจ'),
  logo: yup.string(),
  userName: yup.string().required('ระบุชื่อจริง'),
  categoryId: yup.string().required('ระบุหมวดหมู่ธุรกิจ'),
  userLastName: yup.string().required('ระบุนามสกุล'),
  officeTel: yup.string().required('ระบุเบอร์โทรออฟฟิศ'),
  address: yup.string().required('ระบุที่อยู่ร้าน'),
  mobileTel: yup.string().required('ระบุเบอร์มือถือ'),
  userPosition: yup.string().required('ระบุตำแหน่ง'),
  companyTax: yup.string(),
  bizType: yup.string().required('ระบุประเภทธุรกิจ'),
});

const selectedAuditDataSchema = yup.object().shape({
  AuditData: yup.object().shape({
    id: yup.number().required(),
    number: yup.number().required(),
    image: yup.string().required(),
    title: yup.string().required(),
    content: yup.string().required(),
    auditEffectDescription: yup.string().required(),
    auditEffectImage: yup.string().required(),
    auditShowTitle: yup.string().required(),
    category: yup.string().required(),
    subCategory: yup.string().required(),
    defaultChecked: yup.boolean().required(),
  }),
});
const selectedMaterialDataSchema = yup.object().shape({
  materialData: yup.object().shape({
    id: yup.number().required(),
    name: yup.string().required(),
    description: yup.string().required(),
    image: yup.string().required(),
  }),
});

export const servicesValidationSchema = yup.object().shape({
  id: yup.string().required(),
  title: yup.string().required(),
  description: yup.string().required(),
  unitPrice: yup.number().required(),
  qty: yup.number().positive().integer().required(),
  discountPercent: yup.number(),
  total: yup.number().required(),
  unit: yup.string().required(),
  serviceImage: yup.string().required(),
  serviceImages: yup.array().of(yup.string()).required('เลือกภาพตัวอย่างผลงาน'),
  quotations: yup.mixed(),
  quotationId: yup.string(),
  audits: yup
    .array()
    .of(selectedAuditDataSchema)
    .required('ต้องเลือกมาตรฐานอย่างน้อย 1 รายการ'),
  materials: yup
    .array()
    .of(selectedMaterialDataSchema)
    .required('ต้องเลือกวัสดุอุปกรณ์อย่างน้อย 1 รายการ'),
});
export const quotationsValidationSchema = yup.object().shape({
  id: yup.string().required('ID is required'),
  customer: customersValidationSchema,
  vat7: yup.number(),
  taxType: yup.string(),
  taxValue: yup.number(),
  summary: yup.number(),
  summaryAfterDiscount: yup.number(),
  discountName: yup.string().default('thb'),
  discountValue: yup.number(),
  allTotal: yup.number(),
  dateOffer: yup.string(),
  discountPercentage: yup.number(),
  discountType: yup.string(),
  dateEnd: yup.string(),
  docNumber: yup.string(),
  FCMToken: yup.string().default('none'),
  sellerSignature: yup.string().default('none'),
  services: yup
    .array()
    .of(servicesValidationSchema)
    .required('เพิ่มบริการอย่างน้อย 1 รายการ')
    .min(1, 'ต้องเลือกบริการอย่างน้อย 1 รายการ'),
});
export const serviceValidationSchema = yup.object().shape({
  id: yup.string(),
  title: yup.string().required('ระบุชื่อบริการ'),
  description: yup.string(),
  unitPrice: yup.number().required('ระบุราคาต่อหน่วย'),
  qty: yup.number().required(' required').positive().integer(),
  discountPercent: yup.number(),
  total: yup.number().required(),
  unit: yup.string().required(),
  serviceImage: yup.string().required(),
  serviceImages: yup.array().of(yup.string()),
  audits: yup.array().of(selectedAuditDataSchema),
  materials: yup.array().of(selectedMaterialDataSchema),
});

export const defaultContractSchema = yup.object().shape({
  productWarantyYear: yup
    .number()
    .required('*')
    .positive('ต้องมากกว่า0')
    .integer(),
  skillWarantyYear: yup
    .number()
    .required('*')
    .positive('ต้องมากกว่า0')
    .integer(),
  installingDay: yup
    .number()
    .required('*')
    .positive('ต้องมากกว่า0')
    .integer(),
  workAfterGetDeposit: yup
    .number()
    .required('*')
    .positive('ต้องมากกว่า0')
    .integer(),
  prepareDay: yup
    .number()
    .required('*')
    .positive('ต้องมากกว่า0')
    .integer(),
  finishedDay: yup
    .number()
    .required('*')
    .positive('ต้องมากกว่า0')
    .integer(),
  workCheckDay: yup
    .number()
    .required('*')
    .positive('ต้องมากกว่า0')
    .integer(),
  workCheckEnd: yup
    .number()
    .required('*')
    .positive('ต้องมากกว่า0')
    .integer(),
  adjustPerDay: yup
    .number()
    .required('*')
    .positive('ต้องมากกว่า0')
    .integer(),
});
export const signContractValidationSchema = yup.object().shape({
  projectName: yup.string().required('ระบุชื่อโครงการ'),
  sellerSignature: yup.string(),
  companyUser: yup.object().shape({
  signature: yup.string(),
  }),
  signAddress: yup.string().required('ระบุที่อยู่'),
  signDate: yup.string(),
  signName: yup.string(),
  sellerId: yup.string(),
  servayDate: yup.string(),
  warantyTimeWork: yup.number(),
  customer: customersValidationSchema,
  allTotal: yup.number(),
  contractId: yup.string(),
});
export const installmentValidationSchema = yup.object().shape({
  sellerSignature: yup.string(),
  installments: yup.array().of(
    yup.object().shape({
      amount: yup.number(), // หากคุณต้องการตรวจสอบจำนวนเงิน คุณอาจต้องการปรับแต่งตามความต้องการของคุณ
      details: yup.string().required('ระบุรายละเอียดการชำระงวดนี้'),
      percentage: yup
        .number()
        .required('ระบุจำนวน % การชำระงวดนี้')
        .positive('ต้องมากกว่า 0')
        .integer('ต้องเป็นจำนวนเต็ม'),
    })
  ),
});
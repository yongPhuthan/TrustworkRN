import * as yup from 'yup';

export const customersValidationSchema = yup.object().shape({
  id: yup.string(),
  name: yup.string().required('ระบุชื่อลูกค้า'),
  address: yup.string().required('ระบุที่อยู่ลูกค้า'),
  companyId: yup.string(),
  phone: yup.string(),
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
  discountPercent: yup.number().required(),
  total: yup.number().required(),
  unit: yup.string().required(),
  serviceImage: yup.string().required(),
  serviceImages: yup.array().of(yup.string()).required(),
  quotations: yup.mixed(), // Adjust based on Quotation type
  quotationId: yup.string(),
  audits: yup.array().of(selectedAuditDataSchema).required('ต้องเลือกมาตรฐานอย่างน้อย 1 รายการ'),
  materials: yup.array().of(selectedMaterialDataSchema).required('ต้องเลือกวัสดุอุปกรณ์อย่างน้อย 1 รายการ'),
});
export const quotationsValidationSchema = yup.object().shape({
  id: yup.string().required('ID is required'),
  customer:customersValidationSchema,
  vat7: yup.number(),
  taxName: yup.string().default('notax'),
  taxValue: yup.number(),
  summary: yup.number(),
  summaryAfterDiscount: yup.number(),
  discountName: yup.string().default('thb'),
  discountValue: yup.number(),
  allTotal: yup.number(),
  dateOffer: yup.string(),
  dateEnd: yup.string(),
  docNumber: yup.string(),
  FCMToken: yup.string().default('none'),
  sellerSignature: yup.string().default('none'),
  services: yup.array().of(servicesValidationSchema)
  .required('เพิ่มบริการอย่างน้อย 1 รายการ')
  .min(1, 'ต้องเลือกบริการอย่างน้อย 1 รายการ'),
});


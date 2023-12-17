import * as yup from 'yup';

export const customersValidationSchema = yup.object().shape({
  id: yup.string(),
  customerName: yup.string().required('Name is required'),
  customerAddress: yup.string().required('Address is required'),
  companyId: yup.string(),
  customerType: yup.string().default('none'),
  officePhone: yup.string(),
  mobilePhone: yup.string(),
  emailCustomerApproved: yup.string().default('none'),
  customerPosition: yup.string().default('none'),
  customerNameSign: yup.string().default('none'),
  customerSignature: yup.string().default('none'),
  customerDateSign: yup.string().default('none'),
  customerImage: yup.string().default('none'),
});

export const quotationsValidationSchema = yup.object().shape({
  id: yup.string().required('ID is required'),
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
  dateApproved: yup.string().default('none'),
});

export const servicesValidationSchema = yup.object().shape({
  id: yup.string().required('ID is required'),
  
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  unitPrice: yup.number(),
  qty: yup.number().default(1),
  unit: yup.string().default('none'),
  total: yup.number(),
});

export const materialsValidationSchema = yup.object().shape({
  id: yup.number().required('ID is required'),
  name: yup.string().required('Name is required'),
  description: yup.string(),
  image: yup.string(),
});


export const contractValidationSchema = yup.object().shape({

  warantyTimeWork: yup.number().default(0).required('This field is required'),
  workCheckEnd: yup.number().default(0).required('This field is required'),
  workCheckDay: yup.number().default(0).required('This field is required'),
  installingDay: yup.number().default(0).required('This field is required'),
  adjustPerDay: yup.number().default(0).required('This field is required'),
  workAfterGetDeposit: yup.number().default(0).required('This field is required'),
  prepareDay: yup.number().default(0).required('This field is required'),
  finishedDay: yup.number().default(0).required('This field is required'),
  productWarantyYear: yup.number().default(0).required('This field is required'),
  skillWarantyYear: yup.number().default(0).required('This field is required'),


});


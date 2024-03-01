export const QuotationStatus = {
  ALL: 'ALL',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CONTRACT: 'CONTRACT',
  COMPLETED: 'COMPLETED',
  ONPROCESS: 'ONPROCESS',
  SIGNED_CONTRACT: 'SIGNED_CONTRACT',
  CUSTOMER_APPROVAL_ALLCOMPLETED: 'CUSTOMER_APPROVAL_ALLCOMPLETED',
  CUSTOMER_APPROVAL_SOMECOMPLETED: 'CUSTOMER_APPROVAL_SOMECOMPLETED',
  CUSTOMER_NOTAPPROVAL: 'CUSTOMER_NOTAPPROVAL',
  WAITING_FOR_CUSTOMER_APPROVAL: 'WAITING_FOR_CUSTOMER_APPROVAL',
} as const;

export type QuotationStatusKey = keyof typeof QuotationStatus;


export const FilterLabels: { [key in QuotationStatusKey]: string } = {
    [QuotationStatus.ALL]: 'ทั้งหมด',
    [QuotationStatus.APPROVED]: 'รอทำสัญญา',
    [QuotationStatus.CONTRACT]: 'ทำสัญญาแล้ว',
    [QuotationStatus.COMPLETED]: 'เสร็จสิ้น',
    [QuotationStatus.ONPROCESS]: 'กำลังทำงาน',
    [QuotationStatus.PENDING]: 'รออนุมัติ',
    [QuotationStatus.REJECTED]: 'ไม่อนุมัติ',
    
    // workDelivery
    [QuotationStatus.SIGNED_CONTRACT]: 'เซ็นเอกสารแล้ว',

    [QuotationStatus.CUSTOMER_APPROVAL_ALLCOMPLETED]: 'เสร็จสิ้น',
    [QuotationStatus.CUSTOMER_APPROVAL_SOMECOMPLETED]: 'รอแก้ไขบางส่วน',
    [QuotationStatus.CUSTOMER_NOTAPPROVAL]: 'รอแก้ไขทั้งหมด',
    [QuotationStatus.WAITING_FOR_CUSTOMER_APPROVAL]: 'รอตรวจงาน',


    // Add other labels as needed
  };
  
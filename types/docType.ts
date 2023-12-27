export type Contract = {
  id: string;
  signAddress: string;
  signDate: string;
  signDateStamp: number;
  quotation: Quotation[];
  servayDate: string;
  servayDateStamp: number;
  quotationPageQty: number;
  workCheckDay: number;
  workCheckEnd: number;
  warantyTimeWork: number;
  workAfterGetDeposit: number;
  prepareDay: number;
  installingDay: number;
  finishedDay: number;
  adjustPerDay: number;
  warantyYear: number;
  deposit: number;
  offerContract: SelectedContractData[];
  productWarantyYear: number;
  skillWarantyYear: number;
  offerCheck: string[];
  projectName: string;
  companyUser: CompanyUser | null;
  sellerId: string;
};
export type ServiceList = {
  id: string;
  title: string;
  description: string;
  unitPrice: number;
  qty: number;
  discountPercent: number;
  total: number;
};

export type Quotation = {
  id: string;
  services: Service[];
  customer: Customer;
  vat7: number | undefined;
  taxName: string;
  taxValue: number | undefined;
  summary: number;
  summaryAfterDiscount: number;
  discountName: string;
  discountValue: number;
  allTotal: number;
  dateOffer: string;
  dateEnd: string;
  docNumber: string;
  FCMToken: string;
  sellerSignature: string;
  // ...other fields as per your schema
};


export type CustomerForm = {
  name: string;
  address: string;
  companyId: string;
  phone: string,
  taxId:string

};

export type Workers = {
  id: string;
  name: string;
  mainSkill: string;
  workerStatus: string;
  image: string;

};
export type Service = {
  id: string;
  title: string;
  description: string;
  unitPrice: number;
  qty: number;
  discountPercent: number; 
  total: number; 
  unit: string;
  serviceImage: string;
  serviceImages: string[];
  quotations: Quotation | null;
  quotationId: string | undefined;
  audits: SelectedAuditData[]; 
  materials: SelectedMaterialData[]; 
};
export type Material = {
  id: string;
  title: string;
  description: string;
  name: string
image:string
};

export type SelectedAuditData = {
  AuditData : {
    id: number;
    number: number;
    image: string;
    title: string;
    content: string;
    auditEffectDescription: string;
    auditEffectImage: string;
    auditShowTitle: string;
    category: string;
    subCategory: string;
    createdAt: string;
    defaultChecked: boolean;
    serviceID: string;
  }

} ;

export type SelectedMaterialData = {
  materialData : {
    id: number;
    name: string;
    description: string;
    image: string;
    companyId: string;
    created: string;
    updated: string;
  }

};


export type SelectedContractData = {
  contract: Contract | null;
  contractId: string;
  ContractData: ContractData;
  ContractDataId: number;
};



export type CompanyUser = {
  id: string;
  bizName: string;
  code: string;
  userName: string;
  userLastName: string;
  address: string;
  officeTel: string;
  mobileTel: string;
  userPosition: string;
  bizType: string;
  logo: string;
  signature: string;
  companyNumber: string;
  user: User | null;
  userEmail: string | null;
  wallet: Wallet;
  walletId: string;
  rules: string[];
  quotation: Quotation[];
  bankaccount: any; // You can replace 'any' with a more specific type based on your requirements
  customers: Customer[];
  services: Service[];
  contracts: Contract[];
};

export type Customer = {
  id: string | undefined;
  name: string;
  address: string;
  phone: string;
  quotation: Quotation[];

};

export type WalletTransaction = {
  id: string;
  amount: number;
  status: string;
  user: User | null;
  wallet: Wallet | null;
};

export type User = {
  id: string;
  email: string | null;
  name: string;
  image: string;
} | null;

export type Wallet = {
  id: string;
  balance: number;
  user: User | null;
  transactions: WalletTransaction[];
};

export type ContractData = {
  id: number;
  image: string;
  name: string;
};
export interface IdContractList {
  id: string;
}

export type PeriodPercent = {
  amount: number;
  details: string;
  percentage: number;
  installment: number;
};
export type PeriodPercentType = {
  amount: number;
  details: string;
  installment: number;
  percentage: number;
};
export type EditProductList = {
  EditProductForm: { item: {
    title: string
    id:string
    description:string
    qty:number;
    unit:string;
    total: number;
    unitPrice:number
    discountPercent: number;
    audits: {
      id:string;
      title:string
    }[]
  } };
  SelectAudit: {title: string, description: string};

};

export type DefaultContractType = {
  warantyTimeWork: number;
  workCheckEnd: number;
  workCheckDay: number;
  installingDay: number;
  adjustPerDay: number;
  workAfterGetDeposit: number;
  productWarantyYear: number;
  skillWarantyYear: number;
  prepareDay: number;
  finishedDay: number;
  [key: string]: number;
};
export interface Audit {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  imageUri: string;
  defaultChecked: boolean;
}

export type AuditData = {
  id: number;
  number: number;
  image: string;
  title: string;
  content: string;
  auditEffectDescription: string;
  auditEffectImage: string;
  auditShowTitle: string;
  category: string;
  subCategory: string;
  createdAt: string;
  defaultChecked: boolean;
  serviceID: string;
};

export type MaterialData = {
  id: number;
  name: string;
  description: string;
  image: string;
  companyId: string;
  created: string;
  updated: string;
};

export type FormData = {
  id: string;
  title: string;
  description: string;
  unitPrice: string;
  serviceImages: string[];
  qty: number;
  discountPercent: number;
  total: string;
  audits: AuditData[];
  materials?: MaterialData[];
  unit: string;
};


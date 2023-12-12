import * as contrains from './constrains';

// ACTION => REDUCER

export const all_data = (payload: any) => ({
  type: contrains.ALL_DATA,
  payload,
});
export const initial_serviceId = (payload: string) => ({
  type: contrains.INITIAL_SERVICEID,
  payload,
});
export const remove_audits_in_service_list = (index) => ({
  type: contrains.REMOVE_AUDITS_IN_SERVICE_LIST,
  index,
});
export const all_total = (payload: number) => ({
  type: contrains.ALLTOTAL,
  payload,
});

export const remove_serviceList = (index: number) => {
  console.log('Action creator received index:', index);
  return {
    type: contrains.REMOVE_SERVICE,
    payload: index,
  };
};

export const is_emulator = (payload: boolean) => ({
  type: contrains.IS_EMULATOR,
  payload,
});

export const doc_counter = (payload: number) => ({
  type: contrains.DOC_COUNTER,
  payload,
});

export const deposit_action = (payload: string) => ({
  type: contrains.DEPOSIT,
  payload,
});

export const service_images = (payload: string[]) => ({
  type: contrains.SERVICE_IMAGES,
  payload,
});

export const reset_service_images = () => ({
  type: contrains.RESET_SERVICE_IMAGES,
  
});
export const reset_materials = () => ({
  type: contrains.RESET_MATERIALS,
  
});

export const payment_type = (payload: string) => ({
  type: contrains.PAYMENT_TYPE,
  payload,
});
export const code_company = (payload: string) => ({
  type: contrains.CODE,
  payload,
});
export const prepare_work_days = (payload: number) => ({
  type: contrains.PREPAREWORKDAYS,
  payload,
});
export const start_work_days = (payload: number) => ({
  type: contrains.STARTWORKDAYS,
  payload,
});
export const poduction_days = (payload: number) => ({
  type: contrains.PRODUCTOINDAYS,
  payload,
});

export const offer_contract = (payload: string[]) => ({
  type: contrains.OFFERCONTRACT,
  payload,
});

export const offer_check = (payload: string[]) => ({
  type: contrains.OFFERCHECK,
  payload,
});

export const deposit_type = (payload: string) => ({
  type: contrains.DEPOSIT_TYPE,
  payload,
});

export const period_percent = (payload: object[]) => ({
  type: contrains.PERIOD_PERCENT,
  payload,
});

export const period_thb = (payload: string[]) => ({
  type: contrains.PERIOD_THB,
  payload,
});
export const finished_day = (payload: number) => ({
  type: contrains.FINISHEDDAY,
  payload,
});
export const adjust_day = (payload: number) => ({
  type: contrains.ADJUST_DAYS,
  payload,
});
export const installed_day = (payload: number) => ({
  type: contrains.INSTALLEDDAY,
  payload,
});
export const waranty = (payload: number) => ({
  type: contrains.WARANTY,
  payload,
});
export const sign_date = (payload: string) => ({
  type: contrains.SIGN_DATE,
  payload,
});
export const servay_date = (payload: string) => ({
  type: contrains.SERVAY_DATE,
  payload,
});

export const sign_date_stamp = (payload: number) => ({
  type: contrains.SIGN_DATE_STAMP,
  payload,
});
export const servay_date_stamp = (payload: number) => ({
  type: contrains.SERVAY_DATE_STAMP,
  payload,
});

export const sign_address = (payload: string) => ({
  type: contrains.SIGN_ADDRESS,
  payload,
});

export const project_name = (payload: string) => ({
  type: contrains.PROJECT_NAME,
  payload,
});

export const client_name = (payload: string) => ({
  type: contrains.CLIENT_NAME,
  payload,
});
export const client_address = (payload: string) => ({
  type: contrains.CLIENT_ADDRESS,
  payload,
});
export const client_tel = (payload: string) => ({
  type: contrains.CLIENT_TEll,
  payload,
});
export const client_tax = (payload: string) => ({
  type: contrains.CLIENT_TAX,
  payload,
});

export const service_list = (payload: object[]) => ({
  type: contrains.ADD_SERVICES_LIST,
  payload,
});

export const update_service_list = (payload: object[]) => ({
  type: contrains.UPDATE_SERVICE_LIST,
  payload,
  
});

export const reset_service_list = () => ({
  type: contrains.RESET_SERVICE_LIST,
  
});


export const selected_audit = (serviceId : string, auditData : any) => ({
  type: contrains.SELECTED_AUDIT,
  payload: { serviceId, auditData },

});
export const remove_selected_audit = (serviceId : string, auditId : string) => ({
  type: contrains.REMOVE_SELECTED_AUDIT,
  payload: { serviceId, auditId },

});

export const put_serviceList = (serviceId : string, newData : any) => ({
  type: contrains.PUT_SERVICELIST,
  payload:{ serviceId, newData },
});

export const selected_materials = (serviceId : string, materialsData : any) => ({
  type: contrains.SELECTED_MATERIALS,
  payload:{ serviceId, materialsData },
});
export const existing_audit_array = (payload: object) => ({
  type: contrains.EXISTING_ARRAY_AUDIT,
  payload,
});

export const existing_materials_array = (payload: object) => ({
  type: contrains.EXISTING_ARRAY_MATERIALS,
  payload,
});


export const reset_audit = () => ({
  type: contrains.RESET_AUDIT,
});

export const start_service_list = (payload: object[]) => ({
  type: contrains.START_SERVICE_LIST,
  payload,
});


export const remove_selected_materials = (serviceId: string, materialId: string) => ({
  type: contrains.REMOVE_SELECTED_MATERIALS,
  payload: { serviceId, materialId }
});


export const remove_selected_contract = (payload: object) => ({
  type: contrains.REMOVE_SELECTED_CONTRACT,
  payload,
});

export const selected_contract = (payload: object) => ({
  type: contrains.SELECTED_CONTRACT,
  payload,
});

export const reset_contract = () => ({
  type: contrains.RESET_CONTRACT,
});

export const get_companyID = (payload:string) => ({
  type: contrains.GET_COMPANYID,
  payload,
});

// COMPONENTS  => ACTION

export const initialServiceId = (payload: string) => {
  return (dispatch: any) => {
    dispatch(initial_serviceId(payload));
  };
}

export const docCounter = (payload: number) => {
  return (dispatch: any) => {
    dispatch(doc_counter(payload));
  };
};

export const allData = (payload: object) => {
  return (dispatch: any) => {
    dispatch(all_data(payload));
  };
};
// contracts-page1
export const dePosit = (payload: string) => {
  return (dispatch: any) => {
    dispatch(deposit_action(payload));
  };
};
export const paymentType = (payload: string) => {
  return (dispatch: any) => {
    dispatch(payment_type(payload));
  };
};
export const prepareWorkDays = (payload: number) => {
  return (dispatch: any) => {
    dispatch(prepare_work_days(payload));
  };
};

export const startWorkDays = (payload: number) => {
  return (dispatch: any) => {
    dispatch(start_work_days(payload));
  };
};

export const productionDays = (payload: number) => {
  return (dispatch: any) => {
    dispatch(poduction_days(payload));
  };
};

export const offerContract = (payload: string[]) => {
  return (dispatch: any) => {
    dispatch(offer_contract(payload));
  };
};

export const offerCheck = (payload: string[]) => {
  return (dispatch: any) => {
    dispatch(offer_check(payload));
  };
};

export const depositType = (payload: string) => {
  return (dispatch: any) => {
    dispatch(deposit_type(payload));
  };
};

export const periodPercent = (payload: object[]) => {
  return (dispatch: any) => {
    dispatch(period_percent(payload));
  };
};
export const periodTHB = (payload: string[]) => {
  return (dispatch: any) => {
    dispatch(period_thb(payload));
  };
};
export const finisehdDay = (payload: number) => {
  return (dispatch: any) => {
    dispatch(finished_day(payload));
  };
};
export const adjustDay = (payload: number) => {
  return (dispatch: any) => {
    dispatch(adjust_day(payload));
  };
};
export const installedDay = (payload: number) => {
  return (dispatch: any) => {
    dispatch(installed_day(payload));
  };
};
export const waranTy = (payload: number) => {
  return (dispatch: any) => {
    dispatch(waranty(payload));
  };
};
export const signDate = (payload: string) => {
  return (dispatch: any) => {
    dispatch(sign_date(payload));
  };
};
export const servayDate = (payload: string) => {
  return (dispatch: any) => {
    dispatch(servay_date(payload));
  };
};

export const signDateStamp = (payload: number) => {
  return (dispatch: any) => {
    dispatch(sign_date_stamp(payload));
  };
};
export const servayDateStamp = (payload: number) => {
  return (dispatch: any) => {
    dispatch(servay_date_stamp(payload));
  };
};

export const signAddress = (payload: string) => {
  return (dispatch: any) => {
    dispatch(sign_address(payload));
  };
};

export const projectName = (payload: string) => {
  return (dispatch: any) => {
    dispatch(project_name(payload));
  };
};
export const clientName = (payload: string) => {
  return (dispatch: any) => {
    dispatch(client_name(payload));
  };
};

export const codeCompany = (payload: string) => {
  return (dispatch: any) => {
    dispatch(code_company(payload));
  };
};
export const clientAddress = (payload: string) => {
  return (dispatch: any) => {
    dispatch(client_address(payload));
  };
};
export const clientTel = (payload: string) => {
  return (dispatch: any) => {
    dispatch(client_tel(payload));
  };
};
export const clientVat = (payload: string) => {
  return (dispatch: any) => {
    dispatch(client_tax(payload));
  };
};

export const allTotal = (payload: number) => {
  return (dispatch: any) => {
    dispatch(all_total(payload));
  };
};

export const serviceList = (payload: object[]) => {
  return (dispatch: any) => {
    dispatch(service_list(payload));
  };
};

export const updateServiceList = (payload: object[]) => {
  return (dispatch: any) => {
    dispatch(update_service_list(payload));
  };
};

export const resetServiceList = () => {
  return (dispatch: any) => {
    dispatch(reset_service_list());
  };
};

export const startServiceList = (payload: object[]) => {
  return (dispatch: any) => {
    dispatch(start_service_list(payload));
  };
};
export const selectedAudit = (serviceId: string, auditData: any) => {
  return (dispatch: any) => {
    dispatch(selected_audit(serviceId, auditData));
  };
};

export const selectedMaterials = (serviceId: string, materialsData: any) => {
  return (dispatch: any) => {
    dispatch(selected_materials(serviceId, materialsData));
  };
};
export const putServiceList = (serviceId: string, newData: any) => {
  return (dispatch: any) => {
    dispatch(put_serviceList(serviceId, newData));
  };
};

export const removeSelectedAudit = (serviceId: string, auditId: string) => {
  return (dispatch: any) => {
    dispatch(remove_selected_audit(serviceId, auditId));
  };
};



export const existingAuditArray = (payload: any) => {
  return (dispatch: any) => {
    dispatch(existing_audit_array(payload));
  };
}

export const existingMaterialsArray = (payload: any) => {
  return (dispatch: any) => {
    dispatch(existing_materials_array(payload));
  };
}


export const removeSelectedMaterials = (serviceId: string, materialId: any) => {
  return (dispatch: any) => {
    dispatch(remove_selected_materials(serviceId, materialId));
  };
};
export const removeServiceList = (index: number) => {
  return (dispatch: any) => {
    dispatch(remove_serviceList(index));
  };
}

export const resetAudit = () => {
  return (dispatch: any) => {
    dispatch(reset_audit);
  };
};


export const selectedContract = (payload: object) => {
  return (dispatch: any) => {
    dispatch(selected_contract(payload));
  };
};
export const removeSelectedContract = (payload: object) => {
  return (dispatch: any) => {
    dispatch(remove_selected_contract(payload));
  };
};

export const resetContract = () => {
  return (dispatch: any) => {
    dispatch(reset_contract());
  };
};

export const resetServiceImages = () => {
  return (dispatch: any) => {
    dispatch(reset_service_images());
  };
};
export const resetMaterials = () => {
  return (dispatch: any) => {
    dispatch(reset_materials());
  };
};


export const isEmulator = (payload: boolean) => {
  return (dispatch: any) => {
    dispatch(is_emulator(payload));
  };
};

export const getCompanyID = (payload: string) => {
  return (dispatch: any) => {
    dispatch(get_companyID(payload));
  };
};
export const removeAudits = (index) => {
  return (dispatch) => {
    dispatch(remove_audits_in_service_list(index));
  };
};
export const serviceImages = (payload: string[]) => {
  return (dispatch: any) => {
    dispatch(service_images(payload));
  };
};


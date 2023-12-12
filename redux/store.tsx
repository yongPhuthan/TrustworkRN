import React, {createContext, useReducer} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SelectedAuditData, AuditData} from '../docType';
import * as contrains from './constrains';
import {Service} from '../types/docType';
export type StateType = {
  docCounter: number;
  allData: string;
  paymentType: string;
  deposit: string;
  client_name: string;
  client_tel: string;
  client_tax: string;
  client_address: string;
  serviceList: Service[];
  selectedAudit: AuditData[];
  selectedContract: [];
  periodPercent: JSON[];
  selectedMaterials: [];
  allTotal: number;
  isEmulator: boolean;
  companyID: string;
  code: string;
  serviceImages: string[];
};

type ActionType = {
  type: string;
  payload: string | number | object;
};

type ContextType = {
  state: StateType;
  dispatch: React.Dispatch<ActionType>;
};

export const Store = createContext<ContextType>({
  state: {
    docCounter: 100,
    allData: 'null',
    paymentType: '444',
    deposit: 'null',
    client_name: '',
    client_tax: 'null',
    client_tel: 'null',
    client_address: 'null',
    serviceList: [],
    selectedAudit: [],
    selectedContract: [],
    selectedMaterials: [],
    allTotal: 0,
    periodPercent: [],
    // isEmulator:true,
    isEmulator: true,
    companyID: '',
    code: '',
    serviceImages: [],
  },
  dispatch: () => {},
});

const initialState: StateType = {
  docCounter: 0,
  allData: 'null',
  paymentType: '444',
  deposit: 'null',
  client_name: '',
  client_tax: 'null',
  client_tel: 'null',
  client_address: 'null',
  serviceList: [],
  selectedAudit: [],
  selectedContract: [],
  allTotal: 0,
  periodPercent: [],
  isEmulator: true,
  companyID: '',
  code: '',
  selectedMaterials: [],
  serviceImages: [],
};

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case contrains.ALL_DATA:
      return {...state, allData: action.payload as string};
    case contrains.CODE:
      return {...state, code: action.payload as string};
    case contrains.SERVICE_IMAGES:
      return {...state, serviceImages: action.payload as string[]};
    case contrains.DOC_COUNTER:
      return {...state, docCounter: action.payload as number};
    case contrains.PAYMENT_TYPE:
      return {...state, paymentType: action.payload as string};
    case contrains.DEPOSIT:
      return {...state, deposit: action.payload as string};
    case contrains.CLIENT_NAME:
      return {...state, client_name: action.payload as string};
    case contrains.CLIENT_TEll:
      return {...state, client_tel: action.payload as string};
    case contrains.CLIENT_ADDRESS:
      return {...state, client_address: action.payload as string};
    case contrains.CLIENT_TAX:
      return {...state, client_tax: action.payload as string};
    case contrains.ADD_SERVICES_LIST:
      return {
        ...state,
        serviceList: [...state.serviceList, action.payload] as any,
      };
    case contrains.REMOVE_SERVICE:
      console.log('Removing service at index:', action.payload);
      return {
        ...state,
        serviceList: state.serviceList.filter((_, i) => i !== action.payload),
      };

    case contrains.UPDATE_SERVICE_LIST:
      return {
        ...state,
        serviceList: action.payload as any,
      };

    case contrains.RESET_SERVICE_LIST:
      return {...state, serviceList: []};

    case contrains.PERIOD_PERCENT:
      return {
        ...state,
        periodPercent: action.payload as any,
      };

      case contrains.SELECTED_AUDIT: {
        const { serviceId, auditData: auditSelected } = action.payload as any;
        const updatedServiceList = state.serviceList.map(service => {
          if (service.id === serviceId) {
            const newAudit = { AuditData: auditSelected }; 
            const newAudits = service.audits
              ? [...service.audits, newAudit]
              : [newAudit];
            return {
              ...service,
              audits: newAudits,
            };
          }
      
          return service;
        });
        return {
          ...state,
          serviceList: updatedServiceList,
        } 
      }
      case contrains.SELECTED_MATERIALS:
        {
          const {serviceId, materialsData : meterialSelected} = action.payload as any;
          const updatedServiceList = state.serviceList.map(service => {
            if (service.id === serviceId) {
              const newMaterial = { materialData: meterialSelected }; 
              const newMaterials = service.materials
                ? [...service.materials, newMaterial]
                : [newMaterial];
              return {
                ...service,
                materials: newMaterials,
              };
            }
        
            return service;
          });
          return {
            ...state,
            serviceList: updatedServiceList,
          };
        }
        case contrains.REMOVE_SELECTED_AUDIT: {
          const { serviceId, auditId } = action.payload as any;
        
          const updatedServiceListForRemoveAuditInAuditsArray = state.serviceList.map(service => {
            if (service.id === serviceId) {
              // Check if the service has audits array and filter out the specific audit
              const updatedAudits = service.audits
                ? service.audits.filter(audit => audit.AuditData.id !== auditId)
                : [];
        
              return {
                ...service,
                audits: updatedAudits,
              };
            }
            return service;
          });
        
          return {
            ...state,
            serviceList: updatedServiceListForRemoveAuditInAuditsArray,
          };
        }
        case contrains.REMOVE_SELECTED_MATERIALS: {
          const {serviceId, materialId} = action.payload as any;

          const updatedServiceListForRemoveMaterialInMaterialsArray = state.serviceList.map(service => {
            if (service.id === serviceId) {
              const updatedMaterials = service.materials
                ? service.materials.filter(material => material.materialData.id !== materialId)
                : [];
        
              return {
                ...service,
                materials: updatedMaterials,
              };
            }
            return service;
          });
    
          return {
            ...state,
            serviceList: updatedServiceListForRemoveMaterialInMaterialsArray,
          };
        }
      

    case contrains.INITIAL_SERVICEID:
      if (state.serviceList.some(service => service.id === action.payload)) {
        return state;
      }

      return {
        ...state,
        serviceList: [...state.serviceList, {id: action.payload}] as any,
      };

    case contrains.EXISTING_ARRAY_AUDIT:
      return {
        ...state,
        selectedAudit: [
          ...state.selectedAudit,
          ...(action.payload as AuditData[]),
        ],
      };

    case contrains.RESET_AUDIT:
      return {...state, selectedAudit: []};
    case contrains.RESET_MATERIALS:
      return {...state, selectedMaterials: []};


      // case contrains.REMOVE_AUDITS_IN_SERVICE_LIST:

      const removedAuditDataInServiceList = state.serviceList.map(service => {
        if (service.id === serviceId) {
          // Filter out the auditData that needs to be removed
          const newAudits = service.audits
            ? service.audits.filter(audit => audit.id !== auditData.id)
            : [];
          return {
            ...service,
            audits: newAudits,
          };
        }
        return service;
      }) as any;

      return {
        ...state,
        serviceList: removedAuditDataInServiceList,
      };
    case contrains.EXISTING_ARRAY_MATERIALS:
      return {
        ...state,
        selectedMaterials: [
          ...state.selectedMaterials,
          ...(action.payload as any),
        ],
      } as any;
    case contrains.RESET_MATERIALS:
      return {...state, selectedMaterials: []};
    case contrains.RESET_SERVICE_IMAGES:
      return {...state, serviceImages: []};


    case contrains.START_SERVICE_LIST:
      return {...state, serviceList: action.payload as any};
    case contrains.ALLTOTAL:
      return {...state, allTotal: action.payload as number};

    case contrains.IS_EMULATOR:
      return {...state, isEmulator: action.payload as unknown as boolean};

    case contrains.SELECTED_CONTRACT:
      return {
        ...state,
        selectedContract: [...state.selectedContract, action.payload] as any,
      };

    case contrains.PUT_SERVICELIST: {
      const {serviceId, newData} = action.payload as any;
      const serviceIndex = state.serviceList.findIndex(
        service => service.id === serviceId,
      );

      if (serviceIndex !== -1) {
        const updatedServiceList = [
          ...state.serviceList.slice(0, serviceIndex),
          {...state.serviceList[serviceIndex], ...newData},
          ...state.serviceList.slice(serviceIndex + 1),
        ];

        return {
          ...state,
          serviceList: updatedServiceList,
        };
      } else {
        // Handle service not found
        return state;
      }
    }
    case contrains.REMOVE_SELECTED_CONTRACT:
      return {
        ...state,
        selectedContract: state.selectedContract.filter(
          a => a.title !== action.payload.title,
        ) as any,
      };

    case contrains.RESET_CONTRACT:
      return {...state, selectedContract: []};
    case contrains.GET_COMPANYID:
      return {...state, companyID: action.payload as string};

    default:
      return state;
  }
}

export function StoreProvider(props: any) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // save state to AsyncStorage on state change
  React.useEffect(() => {
    const saveState = async () => {
      try {
        await AsyncStorage.setItem('state', JSON.stringify(state));
      } catch (error) {
        console.log('Error saving state:', error);
      }
    };
    saveState();
  }, [state]);

  // load state from AsyncStorage on component mount
  React.useEffect(() => {
    const loadState = async () => {
      try {
        const storedState = await AsyncStorage.getItem('state');
        if (storedState !== null) {
          dispatch({
            type: 'LOAD_STATE',
            payload: JSON.parse(storedState),
          });
        }
      } catch (error) {
        console.log('Error loading state:', error);
      }
    };
    loadState();
  }, []);

  const value: ContextType = {state, dispatch};
  return <Store.Provider value={value}>{props.children}</Store.Provider>;
}

import React from 'react';
type ServiceType = any; 
type OnAppendService = (newService: ServiceType) => void;
type OnUpdateService = (index: number, newService: ServiceType) => void;

export interface ServiceContextType {
  appendService: OnAppendService;
  updateService: OnUpdateService;
}

const ServiceContext = React.createContext<ServiceContextType>({
    appendService: () => {},
    updateService: () => {}
  });

export default ServiceContext;
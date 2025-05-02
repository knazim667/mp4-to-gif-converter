
   import { extendTheme } from '@chakra-ui/react';

   const theme = extendTheme({
     colors: {
       blue: {
         500: '#3B82F6',
         600: '#2563EB',
       },
       coral: {
         500: '#F472B6',
         600: '#DB679F',
       },
       gray: {
         50: '#F3F4F6',
         100: '#E5E7EB',
         600: '#4B5563',
         800: '#1F2A44',
       },
       green: {
         600: '#10B981',
       },
       red: {
         600: '#EF4444',
       },
     },
     components: {
       Button: {
         baseStyle: {
           fontWeight: 'medium',
           borderRadius: 'lg',
         },
       },
       Input: {
         baseStyle: {
           field: {
             borderRadius: 'lg',
           },
         },
       },
     },
   });

   export default theme;

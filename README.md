FMX Node App
============================

Getting the project started locally
--------------------------------

1. git clone project and cd into fmxNode.
2. [sudo] npm config set registry http://npm.paypal.com -g
3. $ npm install .
4. $ node .
5. In your browser open: http://localhost:8000/fmx/addBank



## Fusion Jobs

https://fusion.paypal.com/jenkins/job/fmxNodeApp-builder/

## Service Fusion jobs


#### walletFiServ :

https://fusion.paypal.com/jenkins/job/walletfiserv/

Component Deploy Job : https://fusion.paypal.com/deploy/job/component_deployer

Minimum services: https://fusion.paypal.com/deploy/job/Default_Stage_Restarter

## Grunt Tasks:
  
```shell
grunt test
```

```shell 
grunt coverage
```

```shell 
grunt build
```

```shell 
grunt automation
```

## Setting up stage:
 https://confluence.paypal.com/cnfl/display/nodejs/Integrated+Stage+Deploy

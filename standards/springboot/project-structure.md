---
id: springboot-project-structure
title: Spring Boot - 项目目录结构约定
tags: [springboot, project-structure, directory, package]
trigger:
  extensions: [.java, .yml, .yaml, .properties]
  frameworks: [springboot]
skip:
  keywords: [组件, 页面, UI, CSS, 样式]
---

# Spring Boot - 项目目录结构约定

## 适用范围
- 适用于所有基于 Spring Boot 的后端项目
- 与 RESTful API 设计规范、数据访问层规范、配置管理规范配合使用
- 适用于 Maven 构建的项目（Gradle 项目参考调整）
- 标准 Maven 目录布局、包名全小写、静态资源放 static、MyBatis XML 放 mapper/、Service 接口分离、启动类放根包等基础约定不再列出，AI 默认遵守

## 规则

### R1: 分层架构包结构
**级别**: 必须
**描述**: 按职责分层组织包结构，包含 controller、service、dao（mapper）、model（entity/dto/vo）、config、util、constant 等包。
**正例**:
```
com.example.project/
├── controller/        # 控制器层，接收请求
├── service/           # 业务逻辑层
│   └── impl/          # Service 实现类
├── dao/               # 数据访问层（也可用 mapper）
├── model/
│   ├── entity/        # 数据库实体
│   ├── dto/           # 数据传输对象
│   └── vo/            # 视图对象
├── config/            # 配置类
├── util/              # 工具类
├── constant/          # 常量定义
├── enums/             # 枚举类
├── exception/         # 自定义异常
└── interceptor/       # 拦截器
```
**反例**:
```
com.example.project/
├── controller/
├── service/
├── mapper/
├── entity/            # entity、dto、vo 混在一起
├── dto/
├── vo/
├── utils/             # 命名不统一（util vs utils）
├── Config.java        # 配置类散落在根包
└── Constants.java     # 常量类散落在根包
```

### R2: 配置文件分层管理
**级别**: 必须
**描述**: 使用 application.yml 作为主配置，通过 application-{profile}.yml 管理多环境配置。
**正例**:
```
src/main/resources/
├── application.yml              # 公共配置
├── application-dev.yml          # 开发环境
├── application-test.yml         # 测试环境
└── application-prod.yml         # 生产环境
```
**反例**:
```
src/main/resources/
├── application.properties       # 混用 properties 格式
├── application-dev.properties
├── config/
│   ├── db.yml                   # 配置散落在子目录
│   ├── redis.yml
│   └── mq.yml
└── application-prod.yml
```

### R3: SQL 脚本存放位置
**级别**: 推荐
**描述**: 数据库初始化脚本和变更脚本统一放在 resources/db/ 目录下，按版本管理。
**正例**:
```
src/main/resources/
└── db/
    ├── schema/               # 建表脚本
    │   ├── V1__init.sql
    │   └── V2__add_order.sql
    └── data/                 # 初始数据
        └── V1__init_data.sql
```
**反例**:
```
src/main/resources/
├── init.sql                  # SQL 脚本散落在根目录
├── update_v2.sql
├── sql/                      # 命名不统一
│   └── create_table.sql
└── db/
    └── migration.sql         # 所有变更合并在一个文件中
```
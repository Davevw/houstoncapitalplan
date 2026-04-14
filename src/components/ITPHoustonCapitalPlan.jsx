import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart, Legend, ComposedChart, Line } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Download, ArrowDownToLine, Upload, FileText, FolderOpen, X, Presentation } from "lucide-react";
import AdminPasscodeGate, { isAdminUnlocked } from "./AdminPasscodeGate";
import TaxDashboard from "./TaxDashboard";
import CapitalModelDownload from "./admin/CapitalModelDownload";
import JVReports from "./admin/JVReports";
import itpLogo from "@/assets/itp-houston-logo.png";
// Data and engine are also kept inline below for Lovable compatibility
// Canonical extracted versions: src/data/projectData.js, src/engine/runModel.js

// ═══════════════════════════════════════════════════════════════
// ITP HOUSTON CAPITAL PLAN — COMPLETE FINANCIAL MODEL (v10)
// Waterfall display corrected: proper tier breakdown per ML feedback
// ITP Houston Capital Plan
// ═══════════════════════════════════════════════════════════════

const LOTS = [
  {id:1,type:"Industrial",acres:3.88,asking:7.25,saleMonth:14},
  {id:2,type:"Retail",acres:1.4,asking:15,saleMonth:13},
  {id:3,type:"Retail",acres:1.2,asking:15,saleMonth:9},
  {id:4,type:"Retail",acres:1.2,asking:15,saleMonth:14},
  {id:5,type:"Industrial",acres:6.4,asking:6.5,saleMonth:8},
  {id:6,type:"Industrial",acres:4.9,asking:6.5,saleMonth:11},
  {id:7,type:"Industrial",acres:3.3,asking:15,saleMonth:8},
  {id:8,type:"Retail",acres:1.3,asking:7,saleMonth:7},
  {id:9,type:"Industrial",acres:3.1,asking:6.5,saleMonth:7},
  {id:10,type:"Industrial",acres:2.4,asking:6.5,saleMonth:7},
  {id:11,type:"Industrial",acres:1.8,asking:6.5,saleMonth:7},
  {id:12,type:"Industrial",acres:1.8,asking:6.5,saleMonth:7},
  {id:13,type:"Multifamily",acres:11.8,asking:6.5,saleMonth:7},
  {id:14,type:"Multifamily",acres:13.2,asking:7.5,saleMonth:14},
  {id:15,type:"Multifamily",acres:11.2,asking:7.5,saleMonth:5},
  {id:16,type:"Multifamily",acres:12.3,asking:7.5,saleMonth:17},
  {id:17,type:"Retail",acres:1.2,asking:15,saleMonth:7},
  {id:18,type:"Retail",acres:1.2,asking:15,saleMonth:22},
  {id:19,type:"Retail",acres:2.0,asking:15,saleMonth:12},
  {id:20,type:"Retail",acres:1.4,asking:15,saleMonth:10},
  {id:21,type:"Retail",acres:1.1,asking:15,saleMonth:15},
  {id:22,type:"Retail",acres:1.2,asking:15,saleMonth:7},
  {id:23,type:"Retail",acres:2.0,asking:15,saleMonth:16},
  {id:24,type:"Retail",acres:1.2,asking:15,saleMonth:15},
  {id:25,type:"Retail",acres:1.4,asking:15,saleMonth:16},
  {id:26,type:"Retail",acres:1.2,asking:15,saleMonth:18},
  {id:27,type:"Retail",acres:1.0,asking:15,saleMonth:19},
  {id:28,type:"Retail",acres:1.0,asking:15,saleMonth:20},
  {id:29,type:"Retail",acres:1.0,asking:15,saleMonth:7},
  {id:30,type:"Retail",acres:1.5,asking:15,saleMonth:5},
];

const HARD_COSTS = [
  {name:"Water Distribution",total:1985225,start:12,dur:9},
  {name:"Sanitary Sewer",total:3434000,start:12,dur:9},
  {name:"Storm Sewer",total:12530025,start:12,dur:9},
  {name:"Roadway",total:5100000,start:22,dur:4},
  {name:"Erosion Control",total:262450,start:10,dur:18},
  {name:"Contingency (15%)",total:277000,start:8,dur:20},
];

const SOFT_COSTS = [
  {name:"Testing & Observation (6%)",total:1319000,start:0,dur:28},
  {name:"Engineering & MTLS Testing",total:84000,start:12,dur:16},
];

const DEEMED_CAPITAL_TOTAL = 11387288.56;
const DEEMED_EXPENDITURES = 8225483.35;
const DEEMED_PREF_RETURN = 3161805.21;
const NUM_MONTHS = 54;

// ── EXPENDITURE DATA (374 items, 2019-2026) ──
const EXPENDITURES = [
{d:"2019-06-26",n:"Title insurance to Riverway Title Group",a:100},
{d:"2019-06-26",n:"TX State Guaranty Fee",a:2},
{d:"2019-06-26",n:"Recording Fees",a:200},
{d:"2019-06-26",n:"Total fund wire out Title Company",a:3685051.48},
{d:"2019-06-14",n:"wire to SKA enviromental",a:88472.03},
{d:"2019-06-26",n:"wire to Mark Lester reimbursed back earnest money plus int",a:42023},
{d:"2019-06-26",n:"ck1005 JM Little -Legal",a:6800},
{d:"2019-06-26",n:"ck1003 Hartline- Initial enviromental",a:1470},
{d:"2019-06-26",n:"ck1000 Chris Amandes- Environmental and meetings",a:2820},
{d:"2019-06-26",n:"ck1002 WEYCER -initial transaction purchase and sale for Stallion",a:3150},
{d:"2019-06-26",n:"CK1006 Mark Lester - Travel",a:1769},
{d:"2019-06-26",n:"wire to KET- Commission",a:50000},
{d:"2019-07-08",n:"CK1007 RIVER OAKS COURIER",a:68.66},
{d:"2019-07-16",n:"CK1008 SKA CONSULTING - OFF SITE PHASE II ESA",a:78252.23},
{d:"2019-07-17",n:"CK1009 CHASE CC 6611 - Carrabba's & Pappas BBQ",a:143.67},
{d:"2019-07-23",n:"CK1010 Mark Lester - Travel 0709-071219",a:1984.99},
{d:"2019-08-06",n:"Ck 1011 SKA Consulting LP Jul 2019",a:39416.47},
{d:"2019-09-11",n:"CK 1012 Amandes PLLC",a:1500},
{d:"2019-09-26",n:"Ck 1013 Goodheart & Associates LLC",a:10000},
{d:"2019-10-29",n:"Ck 1014 SKA Consulting 07/16-0812 2019",a:3871.89},
{d:"2019-10-29",n:"Ck 1015 SKA Consulting Aug  2019",a:12810.2},
{d:"2019-10-29",n:"Ck 1016 SKA Consulting Sept 2019",a:15148.88},
{d:"2019-11-05",n:"Ck 1017 Mark Lester Reimb",a:641.09},
{d:"2019-12-04",n:"Ck 1018 Coastal Mainenance",a:9340},
{d:"2019-12-10",n:"Ck 1019 Alief ISD Tax Office",a:11122.13},
{d:"2019-12-10",n:"Ck 1020 Ann Harris Bennet",a:11486.72},
{d:"2019-12-10",n:"Ck 1021 Alied ISD Tax Office",a:25601.53},
{d:"2019-12-10",n:"Ck 1022 Ann Harris Bennet",a:26440.77},
{d:"2019-12-10",n:"Ck 1023 Chase CC United - Go Daddy",a:12.17},
{d:"2019-12-11",n:"Ck 1024 Pro Froma Advisors",a:9000},
{d:"2019-12-19",n:"Ck 1025 Amandes PLLC",a:180},
{d:"2019-12-19",n:"Ck 1026 Corporate Filings LLC",a:45},
{d:"2020-01-13",n:"Ck 1028 Mark Lester - Travel",a:3820.9},
{d:"2020-01-15",n:"Ck1029 Goodheart & Associates",a:5325},
{d:"2020-01-15",n:"Ck 1030 Mark Lester - Travel",a:1517.01},
{d:"2020-01-15",n:"Ck 1031 SKA Consulting Nov 2019",a:7403.09},
{d:"2020-01-16",n:"Ck 1032 International MGMT Dist",a:2057.84},
{d:"2020-01-16",n:"Ck 1033 International MGMT Dist",a:893.99},
{d:"2020-01-28",n:"Ck 1034 Mark Lest Reimb",a:2782.82},
{d:"2020-02-03",n:"CK 1035 SKA Consulting Oct 2019",a:11702.13},
{d:"2020-02-12",n:"ACH Northwest Metro Holdings",a:1362.7},
{d:"2020-02-19",n:"CK 1036 Pro Forma Advisors LLC",a:2741.8},
{d:"2020-02-25",n:"CK 1037 LANDCO ARESC, LLC",a:2390.25},
{d:"2020-03-03",n:"Ck 1038 FedEx",a:19.49},
{d:"2020-03-11",n:"Ck 1039 Amandes PLLC",a:180},
{d:"2020-03-11",n:"Ck 1040 SKA Consulting Feb 2020",a:36416.09},
{d:"2020-03-17",n:"Ck 1041 SKA Consulting Dec 2019",a:3293.18},
{d:"2020-03-17",n:"Ck 1042 SKA Consulting Jan 2020",a:47966.84},
{d:"2020-04-06",n:"Ck 1043 Amandes PLLC",a:540},
{d:"2020-04-15",n:"Ck 1044 Goodheart & Associates LLC",a:2275},
{d:"2020-05-05",n:"Ck 1045 Max Castillo",a:1200},
{d:"2020-05-12",n:"Ck 1046 Triple-S Steel Supply Co",a:448.14},
{d:"2020-05-19",n:"Ck 1047 SKA Consulting LP Apr 2020",a:40972.06},
{d:"2020-05-28",n:"Wire to Guzman Tires",a:1485},
{d:"2020-06-01",n:"Ck 1049 Mark Lester Reimb",a:169.17},
{d:"2020-06-01",n:"Ck 1050 SKA Consulting March 2020",a:9938.99},
{d:"2020-07-28",n:"Ck 1051 Mark Lester Reimb",a:1476.66},
{d:"2020-08-03",n:"Ck 1053 SKA Consulting May 2020",a:21532.75},
{d:"2020-08-03",n:"Ck 1054 SKA Consulting Jun 2020",a:13712.15},
{d:"2020-08-13",n:"Ck 1055 Kimley Horn Retainer",a:4500},
{d:"2020-09-02",n:"Ck 1056 Coastal Maintenance",a:9340},
{d:"2020-09-16",n:"Ck 1057 UMB Bank",a:3000},
{d:"2020-10-06",n:"Ck 1060 Chase CC - Davis & Associates",a:2250},
{d:"2020-10-06",n:"Ck 1061 SKA Consulting Jul 2020",a:25194.03},
{d:"2020-10-06",n:"Ck 1062 SKA Consulting 0715-081120",a:35086.05},
{d:"2020-10-26",n:"Ck 1063 Kimley-Horn Sept 2020",a:2625},
{d:"2020-10-26",n:"Ck 1064 SKA Consulting 0909-100620",a:10121.65},
{d:"2020-10-26",n:"Ck 1065 SKA Consulting 0812-090820",a:32605.85},
{d:"2020-11-11",n:"Ck 1066 Mark Lester",a:1637.84},
{d:"2020-11-23",n:"Ck 1067 Kimley Horn Oct 202",a:1900},
{d:"2020-12-21",n:"Ck 1068 Alief ISD Tax Office",a:12375.8},
{d:"2020-12-21",n:"Ck 1069 Ann Harris Bennet",a:13007.51},
{d:"2020-12-21",n:"Ck 1070 International MGMT Dist",a:1027.21},
{d:"2020-12-21",n:"Ck 1071 Alief ISD Tax Office",a:24792.8},
{d:"2020-12-21",n:"CK 1072 Ann Harris Bennet",a:26058.29},
{d:"2020-12-21",n:"Ck 1073 International MGMT Dist",a:2057.84},
{d:"2021-02-02",n:"Ck 1074 SKA Consulting 1007-110320",a:9791.02},
{d:"2021-02-02",n:"Ck 1075 SKA Consulting 1104-120120",a:19302.6},
{d:"2021-02-02",n:"Ck 1076 SKA Consulting 1202-123120",a:10707.57},
{d:"2021-02-05",n:"Wire to Northwest Metro Holdings CS 34",a:1362.7},
{d:"2021-02-09",n:"Ck 1077 Kimley Horn Nov 202",a:475},
{d:"2021-03-11",n:"Ck 1078 Coastal Maintenance",a:22400},
{d:"2021-04-28",n:"Ck 1079 SKA Consulting Jan 2021",a:28324.32},
{d:"2021-04-28",n:"Ck 1080 SKA Consulting Feb 2021",a:14697.5},
{d:"2021-04-28",n:"Ck 1081 SKA Consulting Mar 2021",a:7141.81},
{d:"2021-05-26",n:"Ck 1082 Kimley Horn Apr 2021",a:7289.63},
{d:"2021-05-26",n:"Ck UMB Bank",a:2500},
{d:"2022-05-26",n:"Ck 1083 SKA Consulting Apr 2021",a:17756.47},
{d:"2022-06-09",n:"Ck 1086 SKA Consulting May 2021",a:15799.73},
{d:"2021-06-09",n:"Ck 1085 Mark Lester",a:435.83},
{d:"2021-06-23",n:"Ck 1088 Kimley Horn May 2021",a:19911.75},
{d:"2021-08-04",n:"Check 1089 Kimley Horn Jun 2021",a:40185},
{d:"2021-08-04",n:"Check 1090 Mark Lester",a:1953.87},
{d:"2021-08-12",n:"Check 1091 to SKA Consulting 0521-061721",a:71518.75},
{d:"2021-08-26",n:"Check 1092 to SKA Consulting 0618-071521",a:34515.29},
{d:"2021-08-30",n:"Check 1093 to Marcos Lardizabal",a:75},
{d:"2021-09-02",n:"Check 1094 to Goodheart & Associates",a:700},
{d:"2021-09-01",n:"Check 1095 to Kimley Horn Jul 2021",a:3307.5},
{d:"2021-09-01",n:"Check 1096 SKA Consulting 0716-081221",a:112298.25},
{d:"2021-09-01",n:"Check 1097 to Coastal Maintenance",a:9340},
{d:"2021-09-22",n:"Check 1098 to Chase CC - Davis & Associates",a:2250},
{d:"2021-09-23",n:"Check 1100 Kimley Horn Addendum",a:18900},
{d:"2021-10-07",n:"Check 1101 to SKA Consulting 0813-082621",a:102729.74},
{d:"2021-10-20",n:"Check 1102 to SKA Consulting",a:16031.85},
{d:"2021-11-04",n:"Check 1103 to Goodheart & Associates",a:481.25},
{d:"2021-11-04",n:"Check 1104 to SKA Consulting Sep 2021",a:11677.24},
{d:"2021-11-30",n:"Check 1105 to Kimley Horn Aug 2021",a:36319.5},
{d:"2021-11-30",n:"Check 1106 to SKA Consulting Oct 2021",a:11418.34},
{d:"2021-12-09",n:"Check 1107 to Mark Lester",a:1414.32},
{d:"2021-12-15",n:"Check 1108 to Alief ISD Tax Office",a:12381.33},
{d:"2021-12-15",n:"Check 1109 Ann Harris Bennet",a:12704.67},
{d:"2021-12-15",n:"Check 1110 International Mgmt Dist",a:1027.67},
{d:"2021-12-15",n:"Check 1111 to Alief ISD Tax Office",a:24792.8},
{d:"2021-12-15",n:"Check 1112 Ann Harris Bennet",a:25440.23},
{d:"2021-12-15",n:"Check 1113 International Mgmt Dist",a:2057.84},
{d:"2021-12-20",n:"Check 1114 Kimley Horn Aug 2021",a:2352},
{d:"2021-12-20",n:"Check 1115 Kimley Horn Sept 2021",a:29867.26},
{d:"2021-12-20",n:"Check 1116 Kimley Horn Oct 2021",a:1191.23},
{d:"2022-01-19",n:"Check 1117 to SKA Consulting LP Dec 2021",a:8170.33},
{d:"2022-01-25",n:"Check 1118 to Kimley Horn Dec 2021",a:50593.21},
{d:"2022-02-09",n:"Check 1119 Mark Lester",a:1705.37},
{d:"2022-02-16",n:"Check 1120 Kimley Horn Dec 2021",a:1527.75},
{d:"2022-02-16",n:"Check 1121 SKA Consulting LP Nov 2021",a:8867.79},
{d:"2022-02-16",n:"Check 1122 Kimley Horn Jan 2022",a:8940.75},
{d:"2022-02-16",n:"Check 1123 SKA Consulting LP Jan 2022",a:10733.87},
{d:"2022-03-23",n:"Check 1124 Mark Lester",a:2217.9},
{d:"2022-04-21",n:"Check 1125 Mark Lester",a:2070.64},
{d:"2022-05-04",n:"Check 1126 Mark Lester",a:1701.91},
{d:"2022-05-04",n:"Check 1127 SKA Consulting LP Feb 2022",a:15985.08},
{d:"2022-05-05",n:"Check 1128 Chase - Postal",a:8.95},
{d:"2022-05-17",n:"Check 1129 SKA Consulting Feb 2022",a:3165.52},
{d:"2022-05-17",n:"Check 1130 O'Connor",a:1543.1},
{d:"2022-06-08",n:"Check 1131 SKA Consulting LP May 2022",a:12013.39},
{d:"2022-06-08",n:"Check 1132 UMB Bank",a:2500},
{d:"2022-06-15",n:"Check 1133 Coastal Maintenance",a:9532},
{d:"2022-06-15",n:"Check 1134 SKA Consulting Mar 2022",a:14095.86},
{d:"2022-07-13",n:"Check 1135 Kimley Horn May 2022",a:22575},
{d:"2022-07-20",n:"Check 1137 Kimley Horn Jun 2022",a:407.03},
{d:"2022-07-20",n:"Check 1138 Kimley Horn Jun 2022",a:67499.25},
{d:"2022-08-15",n:"Check 1139 SKA Consulting Apr 2022",a:10430.01},
{d:"2022-08-15",n:"Check 1140 SKA Consulting Jun 2022",a:14376.69},
{d:"2022-08-16",n:"Check 1141 Mark Lester",a:2613.51},
{d:"2022-08-23",n:"Check 1142 Kimley-Horn Jul 2022",a:77988.75},
{d:"2022-09-08",n:"Check 1143 FedEx",a:20.63},
{d:"2022-09-08",n:"Check 1144 Kimley-Horn Apr 2022",a:4200},
{d:"2022-09-19",n:"Check 1145 Chase CC - Davis & Associates",a:2250},
{d:"2022-09-28",n:"Check 1146 SKA Consulting Jul 2022",a:42180.84},
{d:"2022-10-05",n:"Check 1147 FedEx",a:20.85},
{d:"2022-11-08",n:"Check 1148 Kimley Horn Aug 2022",a:953.15},
{d:"2022-11-08",n:"Check 1149 Mark Lester",a:1160.28},
{d:"2022-11-17",n:"Check 1150 SKA Consulting Oct 2022",a:25215.6},
{d:"2022-11-17",n:"Check 1151 SKA Consulting Aug 2022",a:89070.13},
{d:"2022-11-17",n:"Check 1152 SKA Consulting Sept 2022",a:32257.96},
{d:"2022-11-17",n:"Check 1153 Chase - ITC 20th Anni Gala",a:2500},
{d:"2022-12-07",n:"Check 1154 Goodheart & Associates",a:2981.25},
{d:"2023-01-13",n:"Check 1155 Ann Harris Bennet",a:11290.72},
{d:"2023-01-13",n:"Check 1156 Alief ISD Tax Office",a:11255.92},
{d:"2023-01-13",n:"Check 1157 International Mgmt Dist",a:969.42},
{d:"2023-01-13",n:"Check 1158 Ann Harris Bennet",a:23967.38},
{d:"2023-01-13",n:"Check 1159 Alief ISD Tax Office",a:23893.52},
{d:"2023-01-13",n:"Check 1160 International Mgmt Dist",a:2057.84},
{d:"2023-02-01",n:"Check 1161 Coastal Maintenance",a:10200},
{d:"2023-02-02",n:"Check 1162 Kimley Horn Aug 2022",a:17745},
{d:"2023-02-02",n:"Check 1163 Kimley Horn Nov 2022",a:41354.26},
{d:"2023-02-07",n:"Check 1164 Allen Boone Humphries Robinson LLC",a:5730},
{d:"2023-03-14",n:"Check 1165 Goodheart & Associates LLC",a:693.75},
{d:"2023-03-22",n:"Check 1166 Kimley Horn Jan 2023",a:85122.46},
{d:"2023-03-22",n:"Check 1167 SKA Consulting Nov 2022",a:7169.26},
{d:"2023-03-22",n:"Check 1168 SKA Consulting Dec 2022",a:12171.67},
{d:"2023-03-22",n:"Check 1169 SKA Consulting Jan 2023",a:7547.89},
{d:"2023-03-22",n:"Check 1170 SKA Consulting Feb 2023",a:3703.89},
{d:"2023-04-26",n:"Check 1171 Roger Gomez",a:96.65},
{d:"2023-05-01",n:"Check 1172 Byron Morales",a:702},
{d:"2023-05-01",n:"Check 1173 Efrain Alarcon",a:945},
{d:"2023-05-01",n:"Check 1174 Juan Carlos Perdomo",a:972},
{d:"2023-05-01",n:"Check 1175 Miguel Puente",a:864},
{d:"2023-05-01",n:"Check 1176 Roger Gomez",a:1080},
{d:"2023-05-01",n:"Check 1177 The Home Depot",a:230.19},
{d:"2023-05-01",n:"Check 1178 Vicente Enrique",a:1026},
{d:"2023-05-18",n:"Check 1179 Kimley Horn Oct 2022",a:8658.02},
{d:"2023-05-18",n:"Check 1180 Kimley Horn Dec 2022",a:81845.16},
{d:"2023-05-18",n:"Check 1181 Kimley Horn Dec 2022",a:3360},
{d:"2023-05-31",n:"Check 1182 The Home Depot",a:1716.42},
{d:"2023-06-13",n:"Check 1183 Mark Lester",a:2788.35},
{d:"2023-06-26",n:"Check 1184 Kimley Horn Apr 2023",a:3696.01},
{d:"2023-06-30",n:"Future Expenditures",a:50000},
{d:"2023-07-26",n:"Check 1185 Mark Lester",a:1965.01},
{d:"2023-07-31",n:"Future Expenditures",a:50000},
{d:"2023-08-02",n:"Check 1186 SKA Consulting Jun 2023",a:34405.77},
{d:"2023-08-09",n:"Check 1187 Waste Connections of TX",a:950.22},
{d:"2023-08-16",n:"Check 1188 Zonda Advisory",a:8750},
{d:"2023-08-29",n:"Check 1189 SKA Consulting Mar 2023",a:6722.64},
{d:"2023-08-29",n:"Check 1190 SKA Consulting Apr 2023",a:2190.57},
{d:"2023-08-29",n:"Check 1191 SKA Consulting May 2023",a:9837.27},
{d:"2023-08-30",n:"Check 1192 SKA Consulting Jul 2023",a:2596.13},
{d:"2023-08-31",n:"Future Expenditures",a:50000},
{d:"2023-09-07",n:"Check 1193 Jefferson Smith Reimb for Waste Connection Inv",a:3180.46},
{d:"2023-09-26",n:"Guarantee Letter",a:521.06},
{d:"2023-10-04",n:"Check 1194 Coastal Maintenance",a:10200},
{d:"2023-10-09",n:"Check 1195 Mark Lester",a:1835.1},
{d:"2023-10-18",n:"Check 1196 Chase CC",a:2250},
{d:"2023-10-18",n:"Check 1197 Goodheart & Associates Dec 2022",a:925},
{d:"2023-10-18",n:"Check 1198 Goodheart & Associates Aug 2023",a:536.25},
{d:"2023-10-18",n:"Check 1199 Goodheart & Associates Sept 2023",a:4475},
{d:"2023-10-18",n:"Check 1200 Kimley Horn Jul 23",a:1242.05},
{d:"2023-10-18",n:"Check 1201 Kimley Horn May 23",a:2205},
{d:"2023-10-18",n:"Check 1202 Kimley Horn Jun 23",a:11274.4},
{d:"2023-10-18",n:"Check 1203 Kimley Horn Aug 23",a:6702.66},
{d:"2023-10-18",n:"Check 1204 SKA Consulting May 23",a:9923.48},
{d:"2023-10-18",n:"Check 1205 SKA Consulting Sep 23",a:3276.73},
{d:"2023-10-18",n:"Check 1206 SKA Consulting Oct 23",a:6109.72},
{d:"2023-10-18",n:"Check 1207 SKA Consulting Aug 23",a:3529.6},
{d:"2023-10-23",n:"Check 1208 Kimley Horn Sep 23",a:4321.9},
{d:"2023-11-09",n:"Check 1209 Goodheart & Associates Oct 23",a:9750},
{d:"2023-11-17",n:"Check 1210 Coastal Maitenance",a:10200},
{d:"2023-11-20",n:"Check 1211 Goodheart & Associates Aug 2023",a:3580},
{d:"2023-11-28",n:"Check 1212 Kimley Horn Oct 23",a:43426.2},
{d:"2023-11-28",n:"Check 1213 SKA Consulting Nov 23",a:2289},
{d:"2023-12-19",n:"Check 1214 Kimley Horn Nov 23",a:63233.33},
{d:"2023-12-20",n:"Check 1215 SKA Consulting Dec 23",a:6028.71},
{d:"2024-01-09",n:"Check 1216 Alief ISD Tax Office",a:19339.32},
{d:"2024-01-09",n:"Check 1217 Ann Harris Bennet",a:22471.61},
{d:"2024-01-09",n:"Check 1218 International Mgmt Dist",a:972.25},
{d:"2024-01-09",n:"Check 1219 Alief ISD Tax Office",a:9593.15},
{d:"2024-01-09",n:"Check 1220 Ann Harris Bennet",a:11146.9},
{d:"2024-01-09",n:"Check 1221 International Mgmt Dist",a:1960},
{d:"2024-01-11",n:"Check 1222 Goodheart & Associates Nov 23",a:47163.2},
{d:"2024-01-11",n:"Check 1223 HR Green Inc",a:6128.25},
{d:"2024-01-11",n:"Check 1225 Zonda Advisory",a:9450},
{d:"2024-01-31",n:"Check 1226 Allen Boone Humphries Robinson",a:18969.89},
{d:"2024-01-31",n:"Check 1227 SKA Consulting Jan 24",a:12312.88},
{d:"2024-01-31",n:"Check 1228 River Oaks Courier",a:107.14},
{d:"2024-02-21",n:"Check 1229 Kimley Horn Sept 2023",a:85115.55},
{d:"2024-02-21",n:"Check 1230 Kimley Horn Dec 2023",a:51230.46},
{d:"2024-02-21",n:"Check 1231 Kimley Horn Jan 2024",a:58631.26},
{d:"2024-02-26",n:"Check 1232 Goodheart & Associates Dec 2023",a:9966.8},
{d:"2024-02-26",n:"Check 1233 Goodheart & Associates Jan 2024",a:5900},
{d:"2024-03-08",n:"Check 1234 Mark Lester Reimb",a:2515.71},
{d:"2024-03-21",n:"Check 1235 Allen Boone Humphries Robinson",a:12693.75},
{d:"2024-03-21",n:"Check 1236 Goodheart & Associates Feb 2024",a:700},
{d:"2024-04-01",n:"Check 1238 Kimley Horn Feb 2024",a:36992.72},
{d:"2024-04-01",n:"Check 1239 SKA Consulting Feb 2024",a:12877.91},
{d:"2024-04-11",n:"Check 1240 Goodheart & Associates",a:1400},
{d:"2024-05-08",n:"Check 1241 SKA Consulting Jan 2024",a:7203.44},
{d:"2024-05-13",n:"Check 1242 Home Depot",a:63.94},
{d:"2024-06-05",n:"Check 1243 Goodheart & Associates",a:700},
{d:"2024-06-05",n:"Check 1244 Kimley Horn Mar 2024",a:55135.71},
{d:"2024-06-05",n:"Check 1245 SKA Consulting Apr 2024 Chris Seigel",a:4173.75},
{d:"2024-06-05",n:"Check 1246 Goodheart & Associates",a:1332.5},
{d:"2024-06-05",n:"Check 1247 Kimley Horn Apr 2024",a:61342.59},
{d:"2024-06-05",n:"Check 1248 SKA Consulting Mar 2024 Mike Schultz Doty MSW",a:11941.95},
{d:"2024-06-05",n:"Check 1249 SKA Consulting Apr 2024 Mike Schultz Doty MSW",a:1821.75},
{d:"2024-06-05",n:"Check 1250 SKA Consulting Apr 2024 Mike Schultz Doty & Olshan",a:22154.52},
{d:"2024-06-05",n:"Check 1251 Chase - Waste Connection Payment",a:568.32},
{d:"2024-06-05",n:"Check 1252 Chase - Waste Connection Payment",a:2089.22},
{d:"2024-06-11",n:"Check 1253 Julio Pavon",a:250},
{d:"2024-06-11",n:"Check 1254 The Home Depot",a:64.89},
{d:"2024-07-01",n:"Check 1255 Ska Consulting Mar 2024 Mike S. Doty & Olshan",a:5533.03},
{d:"2024-07-10",n:"Check 1256 Ska Consulting May 2024 Chris S Doty Wastewater",a:6478.5},
{d:"2024-07-10",n:"Check 1257 Ska Consulting Jun 2024 Chris S. Doty MSW",a:3745.88},
{d:"2024-07-10",n:"Check 1258 Ska Consulting Jun 2024 Chris S Doty Wastewater",a:8478.75},
{d:"2024-07-10",n:"Check 1259 Ska Consulting Jun 2024 Mike S. Doty & Olshan",a:19431.18},
{d:"2024-07-24",n:"Check 1260 The Home Depot",a:1938.77},
{d:"2024-08-13",n:"Check 1261 Chase - Waste Connection Payment",a:664.66},
{d:"2024-08-13",n:"Check 1262 SKA Consulting Jul 2024 Mike S Doty & Olshan",a:15310.76},
{d:"2024-08-13",n:"Check 1263 The Home Depot",a:71.29},
{d:"2024-08-13",n:"Check 1264 Ska Consulting Jul 2024 Chris S Doty Wastewater",a:15892.86},
{d:"2024-08-13",n:"Check 1265 Ska Consulting Jul 2024 Chris S Doty MSW",a:3076.5},
{d:"2024-08-19",n:"Check 1266 Efrain Alarcon",a:1260},
{d:"2024-08-19",n:"Check 1267 Juan Carlos Perdomo",a:1296},
{d:"2024-08-19",n:"Check 1268 Juan Carlos Perdomo Gas Reimb",a:175},
{d:"2024-08-19",n:"Check 1269 Kimley Horn May 2024",a:27742.67},
{d:"2024-08-19",n:"Check 1270 Miguel Puente",a:1152},
{d:"2024-08-19",n:"Check 1271 Roger Gomez",a:1440},
{d:"2024-08-19",n:"Check 1272 Kimley Horn Jun 2024",a:10597.15},
{d:"2024-08-19",n:"Check 1273 Ska Consulting May 2024 Mike S Doty & Olshan",a:11383.51},
{d:"2024-08-19",n:"Check 1274 Ska Consulting May 2024 Mike S Doty MSW",a:2631.41},
{d:"2024-08-26",n:"Check 1275 Chase - Waste Connection Payment",a:2171.5},
{d:"2024-08-26",n:"Check 1276 Juan Carlos Perdomo Gas Reimb",a:100},
{d:"2024-08-26",n:"Check 1277 The Home Depot",a:76.51},
{d:"2024-09-03",n:"Check 1278 Efrain Alarcon",a:1732.5},
{d:"2024-09-03",n:"Check 1279 Juan Carlos Perdomo",a:1944},
{d:"2024-09-03",n:"Check 1280 Juan Carlos Perdomo Reimb",a:200},
{d:"2024-09-03",n:"Check 1281 Miguel Puente",a:1728},
{d:"2024-09-03",n:"Check 1282 Roger Gomez",a:2160},
{d:"2024-09-03",n:"Check 1283 The Home Depot",a:255.32},
{d:"2024-09-04",n:"Check 1284 Chase - Waste Connection Payment",a:5022.8},
{d:"2024-09-17",n:"Check 1286 Chase - Equipment Rental Payment",a:2288.59},
{d:"2024-09-18",n:"Check 1288 Kimley Horn Aug 2024",a:3690.76},
{d:"2024-09-23",n:"Check 1290 Amandes PLLC",a:3540},
{d:"2024-10-02",n:"Check 1291 SKA Consulting Aug 2024 Chris S Doty Wastewater",a:4985.38},
{d:"2024-10-02",n:"Check 1292 SKA Consulting Aug 2024 Chris S MSW Permit",a:51516.16},
{d:"2024-10-02",n:"Check 1293 SKA Consulting Aug 2024 Mike S Doty & Olshab",a:13442.96},
{d:"2024-10-09",n:"Check 1294 SKA Consulting Jul 2024 Chris S Doty MSW",a:2871.75},
{d:"2024-10-09",n:"Check 1295 SKA Consulting Jul 2024 Mike S Doty & Olshan",a:19579.76},
{d:"2024-10-09",n:"Check 1296 SKA Consulting Jul 2024 Chris S Doty Wastewater",a:5970.32},
{d:"2024-10-09",n:"Check 1297 Amandes PLLC",a:12660},
{d:"2024-10-15",n:"Check 1298 Kimley-Horn Sept 2024",a:21619.51},
{d:"2024-11-04",n:"Check 1299 Amandes",a:6612},
{d:"2024-11-04",n:"Check 1300 Chase 6611 Davis & Associates Payment",a:2250},
{d:"2024-11-20",n:"Check 1301 Goodheart & Associates",a:1178.75},
{d:"2024-11-25",n:"Check 1302 Kimley Horn Oct 2024",a:7240.45},
{d:"2024-11-25",n:"Check 1303 SKA Consulting Sept 2024 Mike S Doty & Olshan",a:16646.99},
{d:"2024-11-25",n:"Check 1304 SKA Consulting Sept 2024 Chris S Doty Landfill",a:6292.03},
{d:"2024-11-25",n:"Check 1305 SKA Consulting Oct 2024 Mike S Doty & Landfill",a:14302.15},
{d:"2024-11-25",n:"Check 1306 SKA Consulting Oct 2024 Chris S Doty Wastewater",a:11075.69},
{d:"2024-12-04",n:"Check 1307 Amandes",a:600},
{d:"2024-12-18",n:"Check 1306 Goodheart & Associates",a:461.25},
{d:"2024-12-30",n:"Check 1308 SKA Consulting Nov Chris S Doty Landfill",a:1081.35},
{d:"2024-12-30",n:"Check 1309 Ska Consulting Nov Chris S Doty Wastewater",a:3596.25},
{d:"2024-12-30",n:"Check 1310 Ska Consulting Nov Mike S Doty & Olshan",a:3902.08},
{d:"2025-01-08",n:"Check 1311 Amandes",a:540},
{d:"2025-01-13",n:"Check 1312 Alief ISD Tax Office",a:20532.96},
{d:"2025-01-13",n:"Check 1313 Ann Harris Bennet",a:23991.61},
{d:"2025-01-13",n:"Check 1314 International Mgmt Dist",a:1960},
{d:"2025-01-13",n:"Check 1315 Alief ISD Tax Office",a:10182.21},
{d:"2025-01-13",n:"Check 1316 Ann Harris Bennet",a:11897.35},
{d:"2025-01-13",n:"Check 1317 International Mgmt Dist",a:971.56},
{d:"2025-02-05",n:"Check 1318 Amandes",a:1140},
{d:"2025-02-19",n:"Check 1319 Coastal Maintenance",a:1380},
{d:"2025-03-06",n:"Check 1321 Amandes",a:1380},
{d:"2025-04-08",n:"Check 1322 Amandes",a:660},
{d:"2025-04-17",n:"Check 1323 SKA Consulting Q2 2025 LFG Monitoring",a:7539},
{d:"2025-04-17",n:"Check 1324 SKA Consulting May & Jun 2025 LFG Monitoring",a:3146.5},
{d:"2025-05-07",n:"Check 1327 The Home Depot",a:195.68},
{d:"2025-05-07",n:"Check 1331 Roger Gomez Reimb",a:124},
{d:"2025-05-13",n:"ACH Waste Connections Trash",a:162.38},
{d:"2025-05-27",n:"Check 1328 Chase CC 6611 Waste Connection Payment",a:422.18},
{d:"2025-05-27",n:"Check 1329 Roger Gomez Reimb",a:40},
{d:"2025-06-03",n:"Check 1330 Amandes",a:58220},
{d:"2025-06-25",n:"Check 1332 Goodheart & Associates",a:3485},
{d:"2025-07-16",n:"Check 1334 The Home Depot",a:147.92},
{d:"2025-07-29",n:"Check 1335 The Home Depot",a:101.73},
{d:"2025-08-08",n:"Check 1336 Amandes",a:420},
{d:"2025-08-08",n:"Check 1337 SKA Consulting 5019-0001.P029",a:16782},
{d:"2025-08-08",n:"Check 1338 SKA Consulting 5019-0001.P027",a:7500},
{d:"2025-08-08",n:"Check 1339 SKA Consulting 5019-0002.P002",a:6646.5},
{d:"2025-08-08",n:"Check 1340 SKA Consulting 5019-0002.P003",a:10685.5},
{d:"2025-08-08",n:"Check 1341 SKA Consulting 5019-0003.P001",a:28200},
{d:"2025-08-08",n:"Check 1342 Mark Lester",a:100},
{d:"2025-08-12",n:"Check 1343 Amandes",a:1860},
{d:"2025-09-04",n:"Check 1344 Amandes",a:6240},
{d:"2025-09-04",n:"Check 1345 SKA Consulting 0714-0810 Doty & Olshan",a:9450},
{d:"2025-09-17",n:"Check 1346 Chase CC 3637 Cellphone",a:97.46},
{d:"2025-10-01",n:"Check 1349 Amandes",a:4980},
{d:"2025-10-08",n:"Check 1351 Chase CC 6611 Davis & Associates",a:2250},
{d:"2025-10-08",n:"Check 1352 Coastal Maintenance",a:13500},
{d:"2025-10-15",n:"Check 1353 SKA Consulting Q4 2025 LFG Monitoring",a:10685.5},
{d:"2025-10-17",n:"Wire Mark Lester",a:10000},
{d:"2025-10-22",n:"Check 1354 The Home Depot",a:442.68},
{d:"2025-10-28",n:"Check 1355 Chase CC 4877 Sugar Landfill",a:147.44},
{d:"2025-10-28",n:"Check 1356 The Home Depot",a:975.87},
{d:"2025-10-31",n:"Check 1357 Goodheart & Associates",a:640},
{d:"2025-11-01",n:"Wire Mark Lester",a:10000},
{d:"2025-11-03",n:"Check 1358 FedEx",a:160.08},
{d:"2025-11-24",n:"Check 1360 Byron Morales",a:64},
{d:"2025-11-24",n:"Check 1361 Efrain Alarcon",a:140},
{d:"2025-11-24",n:"Check 1362 Francisco Javier Marin",a:152},
{d:"2025-11-24",n:"Check 1363 Juan C Perdomo",a:72},
{d:"2025-11-24",n:"Check 1364 Miguel Puente",a:64},
{d:"2025-11-24",n:"Check 1365 Vicente Enrique",a:76},
{d:"2025-12-02",n:"Check 1366 Amandes",a:1740},
{d:"2025-12-09",n:"Check 1367 Noelia Garcia Reimb",a:151.36},
{d:"2025-12-09",n:"Check 1368 Annette Ramirez Prop Tax Payment",a:12118.59},
{d:"2025-12-09",n:"Check 1369 Alief ISD Prop Tax Payment",a:9788.8},
{d:"2025-12-09",n:"Check 1370 International Mgmt Dist Prop Tax Payment",a:971.88},
{d:"2025-12-09",n:"Check 1371 Annette Ramirez Prop Tax Payment",a:24439.64},
{d:"2025-12-09",n:"Check 1372 Alief ISD Prop Tax Payment",a:19741.12},
{d:"2025-12-09",n:"Check 1373 International Mgmt Dist Prop Tax Payment",a:1960},
{d:"2025-12-29",n:"Wire Mark Lester",a:10000},
{d:"2026-01-08",n:"Check 1374 SKA Consulting 5019-0001.P028",a:76400},
{d:"2026-01-29",n:"Wire Mark Lester",a:10000},
{d:"2026-02-06",n:"Wire Kimley Horn",a:100000},
{d:"2026-02-11",n:"Check 1375 Home Depot",a:32.71}
];

// ── DEEMED CAPITAL DATA (371 items with interest accrual) ──
const DEEMED_CAPITAL_ITEMS = [
{d:"2019-06-26",a:3685051.48,dy:2439,p:1969937.66},
{d:"2019-06-14",a:88472.03,dy:2451,p:47527.66},
{d:"2019-06-26",a:42023.0,dy:2439,p:22464.46},
{d:"2019-06-26",a:6800.0,dy:2439,p:3635.11},
{d:"2019-06-26",a:1470.0,dy:2439,p:785.83},
{d:"2019-06-26",a:2820.0,dy:2439,p:1507.5},
{d:"2019-06-26",a:3150.0,dy:2439,p:1683.91},
{d:"2019-06-26",a:1769.0,dy:2439,p:945.66},
{d:"2019-06-26",a:50000.0,dy:2439,p:26728.77},
{d:"2019-07-08",a:68.66,dy:2427,p:36.52},
{d:"2019-07-16",a:78252.23,dy:2419,p:41488.69},
{d:"2019-07-17",a:143.67,dy:2418,p:76.14},
{d:"2019-07-23",a:1984.99,dy:2412,p:1049.38},
{d:"2019-08-06",a:39416.47,dy:2398,p:20716.86},
{d:"2019-09-11",a:1500.0,dy:2362,p:776.55},
{d:"2019-09-26",a:10000.0,dy:2347,p:5144.11},
{d:"2019-10-29",a:3871.89,dy:2314,p:1963.74},
{d:"2019-10-29",a:12810.2,dy:2314,p:6497.05},
{d:"2019-10-29",a:15148.88,dy:2314,p:7683.18},
{d:"2019-11-05",a:641.09,dy:2307,p:324.16},
{d:"2019-12-04",a:9340.0,dy:2278,p:4663.35},
{d:"2019-12-10",a:11122.13,dy:2272,p:5538.52},
{d:"2019-12-10",a:11486.72,dy:2272,p:5720.07},
{d:"2019-12-10",a:25601.53,dy:2272,p:12748.86},
{d:"2019-12-10",a:26440.77,dy:2272,p:13166.78},
{d:"2019-12-10",a:12.17,dy:2272,p:6.06},
{d:"2019-12-11",a:9000.0,dy:2271,p:4479.78},
{d:"2019-12-19",a:180.0,dy:2263,p:89.28},
{d:"2019-12-19",a:45.0,dy:2263,p:22.32},
{d:"2020-01-13",a:3820.9,dy:2238,p:1874.23},
{d:"2020-01-15",a:5325.0,dy:2236,p:2609.69},
{d:"2020-01-15",a:1517.01,dy:2236,p:743.46},
{d:"2020-01-15",a:7403.09,dy:2236,p:3628.12},
{d:"2020-01-16",a:2057.84,dy:2235,p:1008.06},
{d:"2020-01-16",a:893.99,dy:2235,p:437.93},
{d:"2020-01-28",a:2782.82,dy:2223,p:1355.88},
{d:"2020-02-03",a:11702.13,dy:2217,p:5686.27},
{d:"2020-02-12",a:1362.7,dy:2208,p:659.47},
{d:"2020-02-19",a:2741.8,dy:2201,p:1322.67},
{d:"2020-02-25",a:2390.25,dy:2195,p:1149.94},
{d:"2020-03-03",a:19.49,dy:2188,p:9.35},
{d:"2020-03-11",a:180.0,dy:2180,p:86.01},
{d:"2020-03-11",a:36416.09,dy:2180,p:17399.91},
{d:"2020-03-17",a:3293.18,dy:2174,p:1569.18},
{d:"2020-03-17",a:47966.84,dy:2174,p:22855.87},
{d:"2020-04-06",a:540.0,dy:2154,p:254.94},
{d:"2020-04-15",a:2275.0,dy:2145,p:1069.56},
{d:"2020-05-05",a:1200.0,dy:2125,p:558.9},
{d:"2020-05-12",a:448.14,dy:2118,p:208.04},
{d:"2020-05-19",a:40972.06,dy:2111,p:18957.15},
{d:"2020-05-28",a:1485.0,dy:2102,p:684.16},
{d:"2020-06-01",a:169.17,dy:2098,p:77.79},
{d:"2020-06-01",a:9938.99,dy:2098,p:4570.3},
{d:"2020-07-28",a:1476.66,dy:2041,p:660.57},
{d:"2020-08-03",a:21532.75,dy:2035,p:9604.2},
{d:"2020-08-03",a:13712.15,dy:2035,p:6115.99},
{d:"2020-08-13",a:4500.0,dy:2025,p:1997.26},
{d:"2020-09-02",a:9340.0,dy:2005,p:4104.48},
{d:"2020-09-16",a:3000.0,dy:1991,p:1309.15},
{d:"2020-10-06",a:2250.0,dy:1971,p:972.0},
{d:"2020-10-06",a:25194.03,dy:1971,p:10883.82},
{d:"2020-10-06",a:35086.05,dy:1971,p:15157.17},
{d:"2020-10-26",a:2625.0,dy:1951,p:1122.49},
{d:"2020-10-26",a:10121.65,dy:1951,p:4328.18},
{d:"2020-10-26",a:32605.85,dy:1951,p:13942.8},
{d:"2020-11-11",a:1637.84,dy:1935,p:694.62},
{d:"2020-11-23",a:1900.0,dy:1923,p:800.81},
{d:"2020-12-21",a:12375.8,dy:1895,p:5140.2},
{d:"2020-12-21",a:13007.51,dy:1895,p:5402.57},
{d:"2020-12-21",a:1027.21,dy:1895,p:426.64},
{d:"2020-12-21",a:24792.8,dy:1895,p:10297.5},
{d:"2020-12-21",a:26058.29,dy:1895,p:10823.11},
{d:"2020-12-21",a:2057.84,dy:1895,p:854.71},
{d:"2021-02-02",a:9791.02,dy:1852,p:3974.35},
{d:"2021-02-02",a:19302.6,dy:1852,p:7835.27},
{d:"2021-02-02",a:10707.57,dy:1852,p:4346.39},
{d:"2021-02-05",a:1362.7,dy:1849,p:552.25},
{d:"2021-02-09",a:475.0,dy:1845,p:192.08},
{d:"2021-03-11",a:22400.0,dy:1815,p:8910.9},
{d:"2021-04-28",a:28324.32,dy:1767,p:10969.66},
{d:"2021-04-28",a:14697.5,dy:1767,p:5692.16},
{d:"2021-04-28",a:7141.81,dy:1767,p:2765.93},
{d:"2021-05-26",a:7289.63,dy:1739,p:2778.45},
{d:"2021-05-26",a:2500.0,dy:1739,p:952.88},
{d:"2022-05-26",a:17756.47,dy:1374,p:5347.37},
{d:"2022-06-09",a:15799.73,dy:1360,p:4709.62},
{d:"2021-06-09",a:435.83,dy:1725,p:164.78},
{d:"2021-06-23",a:19911.75,dy:1711,p:7467.18},
{d:"2021-08-04",a:40185.0,dy:1669,p:14700.0},
{d:"2021-08-04",a:1953.87,dy:1669,p:714.74},
{d:"2021-08-12",a:71518.75,dy:1661,p:26036.74},
{d:"2021-08-26",a:34515.29,dy:1647,p:12459.55},
{d:"2021-08-30",a:75.0,dy:1643,p:27.01},
{d:"2021-09-02",a:700.0,dy:1640,p:251.62},
{d:"2021-09-01",a:3307.5,dy:1641,p:1189.61},
{d:"2021-09-01",a:112298.25,dy:1641,p:40390.45},
{d:"2021-09-01",a:9340.0,dy:1641,p:3359.33},
{d:"2021-09-22",a:2250.0,dy:1620,p:798.9},
{d:"2021-09-23",a:18900.0,dy:1619,p:6706.65},
{d:"2021-10-07",a:102729.74,dy:1605,p:36138.35},
{d:"2021-10-20",a:16031.85,dy:1592,p:5594.02},
{d:"2021-11-04",a:481.25,dy:1577,p:166.34},
{d:"2021-11-04",a:11677.24,dy:1577,p:4036.17},
{d:"2021-11-30",a:36319.5,dy:1551,p:12346.64},
{d:"2021-11-30",a:11418.34,dy:1551,p:3881.61},
{d:"2021-12-09",a:1414.32,dy:1542,p:478.0},
{d:"2021-12-15",a:12381.33,dy:1536,p:4168.27},
{d:"2021-12-15",a:12704.67,dy:1536,p:4277.12},
{d:"2021-12-15",a:1027.67,dy:1536,p:345.97},
{d:"2021-12-15",a:24792.8,dy:1536,p:8346.68},
{d:"2021-12-15",a:25440.23,dy:1536,p:8564.65},
{d:"2021-12-15",a:2057.84,dy:1536,p:692.79},
{d:"2021-12-20",a:2352.0,dy:1531,p:789.24},
{d:"2021-12-20",a:29867.26,dy:1531,p:10022.31},
{d:"2021-12-20",a:1191.23,dy:1531,p:399.73},
{d:"2022-01-19",a:8170.33,dy:1501,p:2687.93},
{d:"2022-01-25",a:50593.21,dy:1495,p:16577.94},
{d:"2022-02-09",a:1705.37,dy:1480,p:553.19},
{d:"2022-02-16",a:1527.75,dy:1473,p:493.23},
{d:"2022-02-16",a:8867.79,dy:1473,p:2862.96},
{d:"2022-02-16",a:8940.75,dy:1473,p:2886.52},
{d:"2022-02-16",a:10733.87,dy:1473,p:3465.42},
{d:"2022-03-23",a:2217.9,dy:1438,p:699.03},
{d:"2022-04-21",a:2070.64,dy:1409,p:639.46},
{d:"2022-05-04",a:1701.91,dy:1396,p:520.74},
{d:"2022-05-04",a:15985.08,dy:1396,p:4891.0},
{d:"2022-05-05",a:8.95,dy:1395,p:2.74},
{d:"2022-05-17",a:3165.52,dy:1383,p:959.54},
{d:"2022-05-17",a:1543.1,dy:1383,p:467.75},
{d:"2022-06-08",a:12013.39,dy:1361,p:3583.61},
{d:"2022-06-08",a:2500.0,dy:1361,p:745.75},
{d:"2022-06-15",a:9532.0,dy:1354,p:2828.78},
{d:"2022-06-15",a:14095.86,dy:1354,p:4183.19},
{d:"2022-07-13",a:22575.0,dy:1326,p:6560.98},
{d:"2022-07-20",a:407.03,dy:1319,p:117.67},
{d:"2022-07-20",a:67499.25,dy:1319,p:19513.76},
{d:"2022-08-15",a:10430.01,dy:1293,p:2955.84},
{d:"2022-08-15",a:14376.69,dy:1293,p:4074.31},
{d:"2022-08-16",a:2613.51,dy:1292,p:740.09},
{d:"2022-08-23",a:77988.75,dy:1285,p:21965.05},
{d:"2022-09-08",a:20.63,dy:1269,p:5.74},
{d:"2022-09-08",a:4200.0,dy:1269,p:1168.18},
{d:"2022-09-19",a:2250.0,dy:1258,p:620.38},
{d:"2022-09-28",a:42180.84,dy:1249,p:11547.15},
{d:"2022-10-05",a:20.85,dy:1242,p:5.68},
{d:"2022-11-08",a:953.15,dy:1208,p:252.36},
{d:"2022-11-08",a:1160.28,dy:1208,p:307.2},
{d:"2022-11-17",a:25215.6,dy:1199,p:6626.52},
{d:"2022-11-17",a:89070.13,dy:1199,p:23407.14},
{d:"2022-11-17",a:32257.96,dy:1199,p:8477.22},
{d:"2022-11-17",a:2500.0,dy:1199,p:656.99},
{d:"2022-12-07",a:2981.25,dy:1179,p:770.39},
{d:"2023-01-13",a:11290.72,dy:1142,p:2826.08},
{d:"2023-01-13",a:11255.92,dy:1142,p:2817.37},
{d:"2023-01-13",a:969.42,dy:1142,p:242.65},
{d:"2023-01-13",a:23967.38,dy:1142,p:5999.07},
{d:"2023-01-13",a:23893.52,dy:1142,p:5980.58},
{d:"2023-01-13",a:2057.84,dy:1142,p:515.08},
{d:"2023-02-01",a:10200.0,dy:1123,p:2510.6},
{d:"2023-02-02",a:17745.0,dy:1122,p:4363.81},
{d:"2023-02-02",a:41354.26,dy:1122,p:10169.75},
{d:"2023-02-07",a:5730.0,dy:1117,p:1402.83},
{d:"2023-03-14",a:693.75,dy:1082,p:164.52},
{d:"2023-03-22",a:85122.46,dy:1074,p:20037.59},
{d:"2023-03-22",a:7169.26,dy:1074,p:1687.62},
{d:"2023-03-22",a:12171.67,dy:1074,p:2865.18},
{d:"2023-03-22",a:7547.89,dy:1074,p:1776.75},
{d:"2023-03-22",a:3703.89,dy:1074,p:871.89},
{d:"2023-04-26",a:96.65,dy:1039,p:22.01},
{d:"2023-05-01",a:702.0,dy:1034,p:159.09},
{d:"2023-05-01",a:945.0,dy:1034,p:214.17},
{d:"2023-05-01",a:972.0,dy:1034,p:220.28},
{d:"2023-05-01",a:864.0,dy:1034,p:195.81},
{d:"2023-05-01",a:1080.0,dy:1034,p:244.76},
{d:"2023-05-01",a:230.19,dy:1034,p:52.17},
{d:"2023-05-01",a:1026.0,dy:1034,p:232.52},
{d:"2023-05-18",a:8658.02,dy:1017,p:1929.91},
{d:"2023-05-18",a:81845.16,dy:1017,p:18243.62},
{d:"2023-05-18",a:3360.0,dy:1017,p:748.96},
{d:"2023-05-31",a:1716.42,dy:1004,p:377.71},
{d:"2023-06-13",a:2788.35,dy:991,p:605.64},
{d:"2023-06-26",a:3696.01,dy:978,p:792.26},
{d:"2023-06-30",a:50000.0,dy:974,p:10673.97},
{d:"2023-07-26",a:1965.01,dy:948,p:408.29},
{d:"2023-07-31",a:50000.0,dy:943,p:10334.25},
{d:"2023-08-02",a:34405.77,dy:941,p:7096.07},
{d:"2023-08-09",a:950.22,dy:934,p:194.52},
{d:"2023-08-16",a:8750.0,dy:927,p:1777.81},
{d:"2023-08-29",a:6722.64,dy:914,p:1346.74},
{d:"2023-08-29",a:2190.57,dy:914,p:438.83},
{d:"2023-08-29",a:9837.27,dy:914,p:1970.69},
{d:"2023-08-30",a:2596.13,dy:913,p:519.51},
{d:"2023-08-31",a:50000.0,dy:912,p:9994.52},
{d:"2023-09-07",a:3180.46,dy:905,p:630.86},
{d:"2023-09-26",a:521.06,dy:886,p:101.19},
{d:"2023-10-04",a:10200.0,dy:878,p:1962.87},
{d:"2023-10-09",a:1835.1,dy:873,p:351.13},
{d:"2023-10-18",a:2250.0,dy:864,p:426.08},
{d:"2023-10-18",a:925.0,dy:864,p:175.17},
{d:"2023-10-18",a:536.25,dy:864,p:101.55},
{d:"2023-10-18",a:4475.0,dy:864,p:847.43},
{d:"2023-10-18",a:1242.05,dy:864,p:235.21},
{d:"2023-10-18",a:2205.0,dy:864,p:417.56},
{d:"2023-10-18",a:11274.4,dy:864,p:2135.03},
{d:"2023-10-18",a:6702.66,dy:864,p:1269.28},
{d:"2023-10-18",a:9923.48,dy:864,p:1879.21},
{d:"2023-10-18",a:3276.73,dy:864,p:620.51},
{d:"2023-10-18",a:6109.72,dy:864,p:1157.0},
{d:"2023-10-18",a:3529.6,dy:864,p:668.4},
{d:"2023-10-23",a:4321.9,dy:859,p:813.7},
{d:"2023-11-09",a:9750.0,dy:842,p:1799.34},
{d:"2023-11-17",a:10200.0,dy:834,p:1864.5},
{d:"2023-11-20",a:3580.0,dy:831,p:652.05},
{d:"2023-11-28",a:43426.2,dy:823,p:7833.37},
{d:"2023-11-28",a:2289.0,dy:823,p:412.9},
{d:"2023-12-19",a:63233.33,dy:802,p:11115.21},
{d:"2023-12-20",a:6028.71,dy:801,p:1058.41},
{d:"2024-01-09",a:19339.32,dy:781,p:3310.47},
{d:"2024-01-09",a:22471.61,dy:781,p:3846.65},
{d:"2024-01-09",a:972.25,dy:781,p:166.43},
{d:"2024-01-09",a:9593.15,dy:781,p:1642.14},
{d:"2024-01-09",a:11146.9,dy:781,p:1908.1},
{d:"2024-01-09",a:1960.0,dy:781,p:335.51},
{d:"2024-01-11",a:47163.2,dy:779,p:8052.63},
{d:"2024-01-11",a:6128.25,dy:779,p:1046.34},
{d:"2024-01-11",a:9450.0,dy:779,p:1613.49},
{d:"2024-01-31",a:18969.89,dy:759,p:3155.76},
{d:"2024-01-31",a:12312.88,dy:759,p:2048.32},
{d:"2024-01-31",a:107.14,dy:759,p:17.82},
{d:"2024-02-21",a:85115.55,dy:738,p:13767.73},
{d:"2024-02-21",a:51230.46,dy:738,p:8286.7},
{d:"2024-02-21",a:58631.26,dy:738,p:9483.81},
{d:"2024-02-26",a:9966.8,dy:733,p:1601.24},
{d:"2024-02-26",a:5900.0,dy:733,p:947.88},
{d:"2024-03-08",a:2515.71,dy:722,p:398.1},
{d:"2024-03-21",a:12693.75,dy:709,p:1972.57},
{d:"2024-03-21",a:700.0,dy:709,p:108.78},
{d:"2024-04-01",a:36992.72,dy:698,p:5659.38},
{d:"2024-04-01",a:12877.91,dy:698,p:1970.14},
{d:"2024-04-11",a:1400.0,dy:688,p:211.11},
{d:"2024-05-08",a:7203.44,dy:661,p:1043.61},
{d:"2024-05-13",a:63.94,dy:656,p:9.19},
{d:"2024-06-05",a:700.0,dy:633,p:97.12},
{d:"2024-06-05",a:55135.71,dy:633,p:7649.51},
{d:"2024-06-05",a:4173.75,dy:633,p:579.06},
{d:"2024-06-05",a:1332.5,dy:633,p:184.87},
{d:"2024-06-05",a:61342.59,dy:633,p:8510.65},
{d:"2024-06-05",a:11941.95,dy:633,p:1656.82},
{d:"2024-06-05",a:1821.75,dy:633,p:252.75},
{d:"2024-06-05",a:22154.52,dy:633,p:3073.71},
{d:"2024-06-05",a:568.32,dy:633,p:78.85},
{d:"2024-06-05",a:2089.22,dy:633,p:289.86},
{d:"2024-06-11",a:250.0,dy:627,p:34.36},
{d:"2024-06-11",a:64.89,dy:627,p:8.92},
{d:"2024-07-01",a:5533.03,dy:607,p:736.12},
{d:"2024-07-10",a:6478.5,dy:598,p:849.13},
{d:"2024-07-10",a:3745.88,dy:598,p:490.97},
{d:"2024-07-10",a:8478.75,dy:598,p:1111.3},
{d:"2024-07-10",a:19431.18,dy:598,p:2546.82},
{d:"2024-07-24",a:1938.77,dy:584,p:248.16},
{d:"2024-08-13",a:664.66,dy:564,p:82.16},
{d:"2024-08-13",a:15310.76,dy:564,p:1892.66},
{d:"2024-08-13",a:71.29,dy:564,p:8.81},
{d:"2024-08-13",a:15892.86,dy:564,p:1964.62},
{d:"2024-08-13",a:3076.5,dy:564,p:380.31},
{d:"2024-08-19",a:1260.0,dy:558,p:154.1},
{d:"2024-08-19",a:1296.0,dy:558,p:158.5},
{d:"2024-08-19",a:175.0,dy:558,p:21.4},
{d:"2024-08-19",a:27742.67,dy:558,p:3392.97},
{d:"2024-08-19",a:1152.0,dy:558,p:140.89},
{d:"2024-08-19",a:1440.0,dy:558,p:176.11},
{d:"2024-08-19",a:10597.15,dy:558,p:1296.05},
{d:"2024-08-19",a:11383.51,dy:558,p:1392.22},
{d:"2024-08-19",a:2631.41,dy:558,p:321.83},
{d:"2024-08-26",a:2171.5,dy:551,p:262.25},
{d:"2024-08-26",a:100.0,dy:551,p:12.08},
{d:"2024-08-26",a:76.51,dy:551,p:9.24},
{d:"2024-09-03",a:1732.5,dy:543,p:206.19},
{d:"2024-09-03",a:1944.0,dy:543,p:231.36},
{d:"2024-09-03",a:200.0,dy:543,p:23.8},
{d:"2024-09-03",a:1728.0,dy:543,p:205.66},
{d:"2024-09-03",a:2160.0,dy:543,p:257.07},
{d:"2024-09-03",a:255.32,dy:543,p:30.39},
{d:"2024-09-04",a:5022.8,dy:542,p:596.68},
{d:"2024-09-17",a:2288.59,dy:529,p:265.35},
{d:"2024-09-18",a:3690.76,dy:528,p:427.12},
{d:"2024-09-23",a:3540.0,dy:523,p:405.79},
{d:"2024-10-02",a:4985.38,dy:514,p:561.64},
{d:"2024-10-02",a:51516.16,dy:514,p:5803.68},
{d:"2024-10-02",a:13442.96,dy:514,p:1514.45},
{d:"2024-10-09",a:2871.75,dy:507,p:319.12},
{d:"2024-10-09",a:19579.76,dy:507,p:2175.77},
{d:"2024-10-09",a:5970.32,dy:507,p:663.44},
{d:"2024-10-09",a:12660.0,dy:507,p:1406.82},
{d:"2024-10-15",a:21619.51,dy:501,p:2374.0},
{d:"2024-11-04",a:6612.0,dy:481,p:697.07},
{d:"2024-11-04",a:2250.0,dy:481,p:237.21},
{d:"2024-11-20",a:1178.75,dy:465,p:120.14},
{d:"2024-11-25",a:7240.45,dy:460,p:730.0},
{d:"2024-11-25",a:16646.99,dy:460,p:1678.38},
{d:"2024-11-25",a:6292.03,dy:460,p:634.37},
{d:"2024-11-25",a:14302.15,dy:460,p:1441.97},
{d:"2024-11-25",a:11075.69,dy:460,p:1116.67},
{d:"2024-12-04",a:600.0,dy:451,p:59.31},
{d:"2024-12-18",a:461.25,dy:437,p:44.18},
{d:"2024-12-30",a:1081.35,dy:425,p:100.73},
{d:"2024-12-30",a:3596.25,dy:425,p:334.99},
{d:"2024-12-30",a:3902.08,dy:425,p:363.48},
{d:"2025-01-08",a:540.0,dy:416,p:49.24},
{d:"2025-01-13",a:20532.96,dy:411,p:1849.65},
{d:"2025-01-13",a:23991.61,dy:411,p:2161.22},
{d:"2025-01-13",a:1960.0,dy:411,p:176.56},
{d:"2025-01-13",a:10182.21,dy:411,p:917.24},
{d:"2025-01-13",a:11897.35,dy:411,p:1071.74},
{d:"2025-01-13",a:971.56,dy:411,p:87.52},
{d:"2025-02-05",a:1140.0,dy:388,p:96.95},
{d:"2025-02-19",a:1380.0,dy:374,p:113.12},
{d:"2025-03-06",a:1380.0,dy:359,p:108.59},
{d:"2025-04-08",a:660.0,dy:326,p:47.16},
{d:"2025-04-17",a:7539.0,dy:317,p:523.81},
{d:"2025-04-17",a:3146.5,dy:317,p:218.62},
{d:"2025-05-07",a:195.68,dy:297,p:12.74},
{d:"2025-05-07",a:124.0,dy:297,p:8.07},
{d:"2025-05-13",a:162.38,dy:291,p:10.36},
{d:"2025-05-27",a:422.18,dy:277,p:25.63},
{d:"2025-05-27",a:40.0,dy:277,p:2.43},
{d:"2025-06-03",a:58220.0,dy:270,p:3445.35},
{d:"2025-06-25",a:3485.0,dy:248,p:189.43},
{d:"2025-07-16",a:147.92,dy:227,p:7.36},
{d:"2025-07-29",a:101.73,dy:214,p:4.77},
{d:"2025-08-08",a:420.0,dy:204,p:18.78},
{d:"2025-08-08",a:16782.0,dy:204,p:750.36},
{d:"2025-08-08",a:7500.0,dy:204,p:335.34},
{d:"2025-08-08",a:6646.5,dy:204,p:297.18},
{d:"2025-08-08",a:10685.5,dy:204,p:477.77},
{d:"2025-08-08",a:28200.0,dy:204,p:1260.89},
{d:"2025-08-08",a:100.0,dy:204,p:4.47},
{d:"2025-08-12",a:1860.0,dy:200,p:81.53},
{d:"2025-09-04",a:6240.0,dy:177,p:242.08},
{d:"2025-09-04",a:9450.0,dy:177,p:366.61},
{d:"2025-09-17",a:97.46,dy:164,p:3.5},
{d:"2025-10-01",a:4980.0,dy:150,p:163.73},
{d:"2025-10-08",a:2250.0,dy:143,p:70.52},
{d:"2025-10-08",a:13500.0,dy:143,p:423.12},
{d:"2025-10-15",a:10685.5,dy:136,p:318.52},
{d:"2025-10-17",a:10000.0,dy:134,p:293.7},
{d:"2025-10-22",a:442.68,dy:129,p:12.52},
{d:"2025-10-28",a:147.44,dy:123,p:3.97},
{d:"2025-10-28",a:975.87,dy:123,p:26.31},
{d:"2025-10-31",a:640.0,dy:120,p:16.83},
{d:"2025-11-01",a:10000.0,dy:119,p:260.82},
{d:"2025-11-03",a:160.08,dy:117,p:4.11},
{d:"2025-11-24",a:64.0,dy:96,p:1.35},
{d:"2025-11-24",a:140.0,dy:96,p:2.95},
{d:"2025-11-24",a:152.0,dy:96,p:3.2},
{d:"2025-11-24",a:72.0,dy:96,p:1.51},
{d:"2025-11-24",a:64.0,dy:96,p:1.35},
{d:"2025-11-24",a:76.0,dy:96,p:1.6},
{d:"2025-12-02",a:1740.0,dy:88,p:33.56},
{d:"2025-12-09",a:151.36,dy:81,p:2.69},
{d:"2025-12-09",a:12118.59,dy:81,p:215.15},
{d:"2025-12-09",a:9788.8,dy:81,p:173.78},
{d:"2025-12-09",a:971.88,dy:81,p:17.25},
{d:"2025-12-09",a:24439.64,dy:81,p:433.89},
{d:"2025-12-09",a:19741.12,dy:81,p:350.47},
{d:"2025-12-09",a:1960.0,dy:81,p:34.8},
{d:"2025-12-29",a:10000.0,dy:61,p:133.7},
{d:"2026-01-08",a:76400.0,dy:51,p:854.01},
{d:"2026-01-29",a:10000.0,dy:30,p:65.75},
{d:"2026-02-06",a:100000.0,dy:22,p:482.19},
{d:"2026-02-11",a:32.71,dy:17,p:0.12}
];

// ═══════════════════════════════════════════════════════════════
// FINANCIAL MODEL ENGINE
// ═══════════════════════════════════════════════════════════════

function runModel(lots, params) {
  const {equity,prefReturn,equityPct,devPct,loanRate,mudTotal,mudMonth1,mudMonth2,devFee} = params;
  const closingPct = 0.04;
  const lotsCalc = lots.map(l => {
    const sf = l.acres*43560;
    const gross = sf*l.asking;
    const closing = gross*closingPct;
    const net = gross-closing;
    return {...l,sf,gross,closing,net};
  });

  const lotRevenue = new Array(NUM_MONTHS+1).fill(0);
  const mudRevenue = new Array(NUM_MONTHS+1).fill(0);
  lotsCalc.forEach(l => {if(l.saleMonth>=0&&l.saleMonth<=NUM_MONTHS)lotRevenue[l.saleMonth]+=l.net;});
  if(mudMonth1<=NUM_MONTHS) mudRevenue[mudMonth1]=mudTotal/2;
  if(mudMonth2<=NUM_MONTHS) mudRevenue[mudMonth2]=mudTotal/2;

  const totalRevenue = lotRevenue.map((v,i)=>v+mudRevenue[i]);
  const hardCostMo = new Array(NUM_MONTHS+1).fill(0);
  const softCostMo = new Array(NUM_MONTHS+1).fill(0);
  HARD_COSTS.forEach(c=>{for(let m=c.start;m<c.start+c.dur&&m<=NUM_MONTHS;m++)hardCostMo[m]+=c.total/c.dur;});
  SOFT_COSTS.forEach(c=>{for(let m=c.start;m<c.start+c.dur&&m<=NUM_MONTHS;m++)softCostMo[m]+=c.total/c.dur;});

  const devFeeMo = hardCostMo.map((h,i)=>(h+softCostMo[i])*devFee);
  const landMo = new Array(NUM_MONTHS+1).fill(0);
  landMo[0] = equity;
  const unleveredCost = landMo.map((l,i)=>l+hardCostMo[i]+softCostMo[i]+devFeeMo[i]);
  const finFixedMo = new Array(NUM_MONTHS+1).fill(0);
  finFixedMo[0] = 240000+150000;

  const escrowBeg=new Array(NUM_MONTHS+1).fill(0),escrowEnd=new Array(NUM_MONTHS+1).fill(0);
  const loanBeg=new Array(NUM_MONTHS+1).fill(0),loanEnd=new Array(NUM_MONTHS+1).fill(0);
  const loanInt=new Array(NUM_MONTHS+1).fill(0),loanDraw=new Array(NUM_MONTHS+1).fill(0),loanPay=new Array(NUM_MONTHS+1).fill(0);

  for(let m=0;m<=NUM_MONTHS;m++){
    escrowBeg[m]=m===0?0:escrowEnd[m-1];
    loanBeg[m]=m===0?0:loanEnd[m-1];
    loanInt[m]=loanBeg[m]*loanRate/12;
    const expenses=hardCostMo[m]+softCostMo[m]+devFeeMo[m]+finFixedMo[m]+loanInt[m];
    const inflow=totalRevenue[m];
    const avail=escrowBeg[m]+inflow;
    loanDraw[m]=Math.max(0,expenses-avail);
    loanPay[m]=Math.min(loanBeg[m],Math.max(0,avail-expenses));
    const outflow=Math.min(expenses+loanPay[m],Math.max(0,avail));
    escrowEnd[m]=Math.max(0,avail-outflow);
    loanEnd[m]=Math.max(0,loanBeg[m]+loanDraw[m]-loanPay[m]);
  }

  const totalFinCost=finFixedMo.map((f,i)=>f+loanInt[i]);
  const leveredCF=totalRevenue.map((r,i)=>r-unleveredCost[i]-totalFinCost[i]+(loanDraw[i]-loanPay[i]));

  // ── PROPER WATERFALL: Two-pass approach ──
  // Pass 1: Track all equity contributions, pref accrual, and distributions
  //         WITHOUT splitting profits — all positive CF goes to equity first.
  // Pass 2: After all months processed, any remaining surplus is the true
  //         residual that gets split between equity and developer.
  const eqBeg=new Array(NUM_MONTHS+1).fill(0),eqContrib=new Array(NUM_MONTHS+1).fill(0);
  const eqPref=new Array(NUM_MONTHS+1).fill(0),eqDist=new Array(NUM_MONTHS+1).fill(0);
  const eqEnd=new Array(NUM_MONTHS+1).fill(0),remaining=new Array(NUM_MONTHS+1).fill(0);
  const eqFinalDist=new Array(NUM_MONTHS+1).fill(0),devFinalDist=new Array(NUM_MONTHS+1).fill(0);

  // Pass 1: All positive CF goes to equity (capital return + pref)
  for(let m=0;m<=NUM_MONTHS;m++){
    eqBeg[m]=m===0?0:eqEnd[m-1];
    eqContrib[m]=leveredCF[m]<0?-leveredCF[m]:0;
    eqPref[m]=m===0?0:eqBeg[m]*((1+prefReturn)**(1/12)-1);
    const eqOwed=eqBeg[m]+eqContrib[m]+eqPref[m];
    if(leveredCF[m]>0){
      const payToEquity=Math.min(leveredCF[m],eqOwed);
      eqDist[m]=-payToEquity;
    } else {
      eqDist[m]=0;
    }
    eqEnd[m]=eqOwed+eqDist[m];
  }
  // Pass 2: Final settlement at end of project
  // Any remaining equity balance is paid from accumulated surplus,
  // then true residual splits between equity and developer.
  const finalBal=eqEnd[NUM_MONTHS]; // outstanding equity balance
  const totalPosCF=leveredCF.reduce((a,cf)=>a+(cf>0?cf:0),0);
  const totalDistributed=-eqDist.reduce((a,b)=>a+b,0);
  const surplusCF=totalPosCF-totalDistributed; // CF not yet distributed
  // First: pay off remaining equity balance from surplus
  const finalPayoff=Math.min(surplusCF,finalBal);
  // True residual: whatever's left after equity is fully made whole
  const totalResidual=Math.max(0,surplusCF-finalPayoff);
  // Allocate to last month
  eqDist[NUM_MONTHS]+=-finalPayoff; // additional distribution to clear balance
  eqEnd[NUM_MONTHS]=Math.max(0,finalBal-finalPayoff);
  remaining[NUM_MONTHS]=totalResidual;
  eqFinalDist[NUM_MONTHS]=totalResidual*equityPct;
  devFinalDist[NUM_MONTHS]=totalResidual*devPct;

  const totalLotRev=lotRevenue.reduce((a,b)=>a+b,0);
  const totalMudRev=mudRevenue.reduce((a,b)=>a+b,0);
  const totalRev=totalLotRev+totalMudRev;
  const totalHard=HARD_COSTS.reduce((a,c)=>a+c.total,0);
  const totalSoft=SOFT_COSTS.reduce((a,c)=>a+c.total,0);
  const totalDevFee=devFeeMo.reduce((a,b)=>a+b,0);
  const totalUnlev=unleveredCost.reduce((a,b)=>a+b,0);
  const totalFin=totalFinCost.reduce((a,b)=>a+b,0);
  const totalCost=totalUnlev+totalFin;
  const totalProfit=totalRev-totalCost;
  const peakLoan=Math.max(...loanEnd);
  const eqTotalContrib=eqContrib.reduce((a,b)=>a+b,0);
  const eqTotalPref=eqPref.reduce((a,b)=>a+b,0);
  const eqTotalDist=-eqDist.reduce((a,b)=>a+b,0);
  const eqTotalFinal=eqFinalDist.reduce((a,b)=>a+b,0);
  const devTotalFinal=devFinalDist.reduce((a,b)=>a+b,0);
  const eqNetProfit=eqTotalDist+eqTotalFinal-eqTotalContrib;
  const devNetProfit=devTotalFinal;
  const eqMultiple=eqTotalContrib>0?(eqTotalDist+eqTotalFinal)/eqTotalContrib:0;
  let cumCF=0;
  const monthlyCFData=leveredCF.map((cf,i)=>{cumCF+=cf;return{month:i,cf,cumCF,revenue:totalRevenue[i],cost:unleveredCost[i]+totalFinCost[i]};});
  const lotSummary={};
  lotsCalc.forEach(l=>{if(!lotSummary[l.type])lotSummary[l.type]={count:0,acres:0,value:0};lotSummary[l.type].count++;lotSummary[l.type].acres+=l.acres;lotSummary[l.type].value+=l.net;});

  return {
    lotsCalc,lotSummary,monthlyCFData,totalRev,totalLotRev,totalMudRev,totalCost,totalProfit,
    totalHard,totalSoft,totalDevFee,totalFin,peakLoan,eqTotalContrib,eqTotalPref,eqTotalDist,
    eqTotalFinal,eqNetProfit,devNetProfit,eqMultiple,lotRevenue,mudRevenue,hardCostMo,softCostMo,
    totalRevenue,unleveredCost,devFeeMo,landMo,finFixedMo,loanInt,loanDraw,loanPay,loanBeg,loanEnd,
    escrowBeg,escrowEnd,totalFinCost,leveredCF,eqBeg,eqContrib,eqPref,eqDist,eqEnd,
    remaining,eqFinalDist,devFinalDist,totalUnlev,
    equity:params.equity,prefReturn:params.prefReturn,equityPct:params.equityPct,devPct:params.devPct,
  };
}

// ═══════════════════════════════════════════════════════════════
// FORMATTING & DESIGN SYSTEM
// ═══════════════════════════════════════════════════════════════
const fmt=n=>{if(Math.abs(n)>=1e6)return"$"+(n/1e6).toFixed(1)+"M";if(Math.abs(n)>=1e3)return"$"+(n/1e3).toFixed(0)+"K";return"$"+n.toFixed(0);};
const fmtFull=n=>"$"+n.toLocaleString("en-US",{maximumFractionDigits:0});
const pct=n=>(n*100).toFixed(1)+"%";
const NAVY="#0B3D5C",TEAL="#0B4C72",STEEL="#95B7C4",TERRA="#C4703E",GOLD="#D4A84B",LIGHT="#F0F6F8";

function MetricCard({label,value,sub,accent}){
  return(<div style={{background:"white",borderRadius:12,padding:"20px 24px",borderLeft:`4px solid ${accent||TEAL}`,boxShadow:"0 1px 3px rgba(0,0,0,0.08)",display:"flex",flexDirection:"column",gap:4,minWidth:0}}>
    <div style={{fontSize:12,fontWeight:600,color:"#7A8B9A",textTransform:"uppercase",letterSpacing:1}}>{label}</div>
    <div style={{fontSize:26,fontWeight:700,color:NAVY,fontFamily:"Georgia,serif"}}>{value}</div>
    {sub&&<div style={{fontSize:12,color:"#9AA5B0"}}>{sub}</div>}
  </div>);
}

function SliderInput({label,value,onChange,min,max,step,format}){
  return(<div style={{marginBottom:16}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
      <span style={{fontSize:12,fontWeight:600,color:NAVY}}>{label}</span>
      <span style={{fontSize:13,fontWeight:700,color:TERRA,fontFamily:"Georgia,serif"}}>{format?format(value):value}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(parseFloat(e.target.value))} style={{width:"100%",accentColor:TEAL,height:6,cursor:"pointer"}}/>
  </div>);
}

function SectionTitle({children,icon}){
  return(<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,marginTop:32,paddingBottom:10,borderBottom:`2px solid ${STEEL}`}}>
    {icon&&<span style={{fontSize:20}}>{icon}</span>}
    <h2 style={{margin:0,fontSize:18,fontWeight:700,color:NAVY,fontFamily:"Georgia,serif",letterSpacing:0.5}}>{children}</h2>
  </div>);
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════

const TABS=["Dashboard","Lot Schedule","Cash Flows","Capital Stack","Expenditures","Deemed Capital","Financial Model"];
const BUILD_STAMP = "2026-03-30-1919";

export default function App(){
  const [activeTab,setActiveTab]=useState(0);
  const [lots,setLots]=useState(LOTS);
  const [params,setParams]=useState({
    equity:DEEMED_CAPITAL_TOTAL,prefReturn:0.08,equityPct:0.50,devPct:0.50,
    loanRate:0.11,mudTotal:23400000,mudMonth1:15,mudMonth2:21,devFee:0.05,
  });
  const model=useMemo(()=>runModel(lots,params),[lots,params]);
  const updateParam=useCallback((key,val)=>setParams(p=>({...p,[key]:val})),[]);
  const updateLot=useCallback((id,month)=>setLots(prev=>prev.map(l=>l.id===id?{...l,saleMonth:month}:l)),[]);

  const [showPresentation, setShowPresentation] = useState(false);
  const [presentationUrl, setPresentationUrl] = useState(null);
  const [activeAdminTab, setActiveAdminTab] = useState(null);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showAdminGate, setShowAdminGate] = useState(false);
  const [pendingAdminTab, setPendingAdminTab] = useState(null);
  const adminMenuRef = useRef(null);

  // Close admin dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (adminMenuRef.current && !adminMenuRef.current.contains(e.target)) {
        setShowAdminMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const { data } = supabase.storage.from("itph-data-vault").getPublicUrl("Presentations/ITP_Houston_Investor_Presentation.pdf");
    if (data?.publicUrl) setPresentationUrl(data.publicUrl);
  }, []);

  function handleAdminTabClick(tab) {
    if (isAdminUnlocked()) {
      setActiveAdminTab(activeAdminTab === tab ? null : tab);
      setShowAdminMenu(false);
    } else {
      setPendingAdminTab(tab);
      setShowAdminGate(true);
      setShowAdminMenu(false);
    }
  }

  function handleAdminUnlocked() {
    setShowAdminGate(false);
    setShowAdminMenu(true);
  }

  return(
    <div data-build={BUILD_STAMP} style={{minHeight:"100vh",background:"#F7F9FB",fontFamily:"Calibri,-apple-system,sans-serif"}}>
      {showAdminGate && (
        <AdminPasscodeGate
          onSuccess={handleAdminUnlocked}
          onClose={() => { setShowAdminGate(false); setPendingAdminTab(null); }}
        />
      )}
      <div style={{background:`linear-gradient(135deg,${NAVY} 0%,${TEAL} 100%)`,padding:"28px 32px 20px",color:"white"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:16}}>
            <div style={{display:"flex",alignItems:"center",gap:16}}>
              <img src={itpLogo} alt="ITP Houston" width={70} height={70} />
              <div>
                <h1 style={{margin:0,fontSize:28,fontFamily:"Georgia,serif",fontWeight:700,letterSpacing:0.5}}>ITP Houston Capital Plan</h1>
                <div style={{fontSize:14,opacity:0.8,marginTop:4}}>136-Acre Master-Planned Development &nbsp;|&nbsp; 12000 Bissonnet Street, Houston TX</div>
              </div>
            </div>
            <div style={{textAlign:"right",fontSize:12,opacity:0.6}}>
              <div>Last Update: April 13, 2026</div>
              <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
                <button
                  onClick={() => setShowPresentation(true)}
                  style={{display:"inline-flex",alignItems:"center",gap:6,background:"white",color:NAVY,border:"none",padding:"10px 20px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.2s",boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}
                  onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.02)";e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.25)"}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.15)"}}
                >
                  <Presentation size={16} /> View Investor Presentation
                </button>
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:3,marginTop:20,flexWrap:"wrap",alignItems:"center"}}>
            {TABS.map((t,i)=>(
              <button key={t} onClick={()=>setActiveTab(i)} style={{padding:"9px 16px",border:"none",borderRadius:"8px 8px 0 0",cursor:"pointer",fontSize:12,fontWeight:600,letterSpacing:0.3,transition:"all 0.2s",background:activeTab===i?"white":"rgba(255,255,255,0.12)",color:activeTab===i?NAVY:"rgba(255,255,255,0.8)"}}>{t}</button>
            ))}
            <div style={{marginLeft:"auto",position:"relative"}} ref={adminMenuRef}>
              <button
                onClick={()=>{
                  if (isAdminUnlocked()) {
                    setShowAdminMenu(!showAdminMenu);
                  } else {
                    setShowAdminGate(true);
                  }
                }}
                style={{padding:"9px 16px",border:"none",borderRadius:"8px 8px 0 0",cursor:"pointer",fontSize:12,fontWeight:600,letterSpacing:0.3,transition:"all 0.2s",background:activeAdminTab?"white":"rgba(255,255,255,0.12)",color:activeAdminTab?NAVY:"rgba(255,255,255,0.8)",display:"flex",alignItems:"center",gap:6}}
              >
                🔒 Admin ▾
              </button>
              {showAdminMenu && isAdminUnlocked() && (
                <div style={{position:"absolute",right:0,top:"100%",background:"white",borderRadius:"0 0 8px 8px",boxShadow:"0 8px 24px rgba(0,0,0,0.2)",minWidth:180,zIndex:9999,overflow:"hidden"}}>
                  {[{id:"data-vault",icon:"📊",label:"Data Vault"},{id:"waterfall",icon:"💧",label:"Waterfall"},{id:"tax-dashboard",icon:"🏛️",label:"Tax Dashboard"},{id:"capital-model",icon:"📈",label:"Capital Model"}].map(item=>(
                    <button key={item.id} onClick={()=>{setActiveAdminTab(item.id); setShowAdminMenu(false);}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"12px 16px",border:"none",background:activeAdminTab===item.id?"#F0F6F8":"white",color:NAVY,fontSize:13,fontWeight:activeAdminTab===item.id?700:500,cursor:"pointer",textAlign:"left",transition:"background 0.15s"}}
                      onMouseEnter={e=>{if(activeAdminTab!==item.id)e.currentTarget.style.background="#F7F9FB"}}
                      onMouseLeave={e=>{if(activeAdminTab!==item.id)e.currentTarget.style.background="white"}}
                    >
                      <span>{item.icon}</span>{item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"24px 32px 60px"}}>
        {activeTab===0&&<DashboardTab model={model} params={params} updateParam={updateParam}/>}
        {activeTab===1&&<LotTab lots={lots} model={model} updateLot={updateLot}/>}
        {activeTab===2&&<CashFlowTab model={model}/>}
        {activeTab===3&&<CapitalStackTab model={model} params={params}/>}
        {activeTab===4&&<ExpendituresTab/>}
        {activeTab===5&&<DeemedCapitalTab/>}
        {activeTab===6&&<SpreadsheetTab model={model} params={params}/>}
      </div>

      {/* Admin overlay panels (footer nav tabs) */}
      {activeAdminTab === "tax-dashboard" && (
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"white",zIndex:8000,overflowY:"auto"}}>
          <div style={{position:"sticky",top:0,zIndex:1,background:"white",borderBottom:"1px solid #E0E4E8",padding:"12px 20px",display:"flex",justifyContent:"flex-end"}}>
            <button onClick={()=>setActiveAdminTab(null)} style={{background:"none",border:"none",color:"#7A8B9A",cursor:"pointer",fontSize:14,fontWeight:600,padding:"8px 14px",borderRadius:8,display:"flex",alignItems:"center",gap:6}}>✕ Close Dashboard</button>
          </div>
          <TaxDashboard/>
        </div>
      )}
      {activeAdminTab === "waterfall" && (
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"white",zIndex:8000,overflowY:"auto"}}>
          <div style={{position:"sticky",top:0,zIndex:1,background:"white",borderBottom:"1px solid #E0E4E8",padding:"12px 20px",display:"flex",justifyContent:"flex-end"}}>
            <button onClick={()=>setActiveAdminTab(null)} style={{background:"none",border:"none",color:"#7A8B9A",cursor:"pointer",fontSize:14,fontWeight:600,padding:"8px 14px",borderRadius:8,display:"flex",alignItems:"center",gap:6}}>✕ Close Waterfall</button>
          </div>
          <div style={{maxWidth:1200,margin:"0 auto",padding:"24px 32px"}}>
            <WaterfallTab model={model} params={params} updateParam={updateParam}/>
          </div>
        </div>
      )}
      {activeAdminTab === "data-vault" && (
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"white",zIndex:8000,overflowY:"auto"}}>
          <div style={{position:"sticky",top:0,zIndex:1,background:"white",borderBottom:"1px solid #E0E4E8",padding:"12px 20px",display:"flex",justifyContent:"flex-end"}}>
            <button onClick={()=>setActiveAdminTab(null)} style={{background:"none",border:"none",color:"#7A8B9A",cursor:"pointer",fontSize:14,fontWeight:600,padding:"8px 14px",borderRadius:8,display:"flex",alignItems:"center",gap:6}}>✕ Close Data Vault</button>
          </div>
          <div style={{maxWidth:1200,margin:"0 auto",padding:"24px 32px"}}>
            <DataVaultTab/>
          </div>
        </div>
      )}
      )}
      {activeAdminTab === "capital-model" && (
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"white",zIndex:8000,overflowY:"auto"}}>
          <div style={{position:"sticky",top:0,zIndex:1,background:"white",borderBottom:"1px solid #E0E4E8",padding:"12px 20px",display:"flex",justifyContent:"flex-end"}}>
            <button onClick={()=>setActiveAdminTab(null)} style={{background:"none",border:"none",color:"#7A8B9A",cursor:"pointer",fontSize:14,fontWeight:600,padding:"8px 14px",borderRadius:8,display:"flex",alignItems:"center",gap:6}}>✕ Close Capital Model</button>
          </div>
          <div style={{maxWidth:1200,margin:"0 auto",padding:"24px 32px"}}>
            <CapitalModelDownload/>
          </div>
        </div>
      )}

      {/* Investor Presentation Modal */}
      {showPresentation && (
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setShowPresentation(false)}>
          <div style={{background:"white",width:"90%",maxWidth:900,maxHeight:"85vh",borderRadius:16,overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 8px 32px rgba(0,0,0,0.3)"}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 24px",borderBottom:"1px solid #E0E4E8"}}>
              <div style={{fontSize:16,fontWeight:700,color:NAVY}}>Investor Presentation — ITP Houston</div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                {presentationUrl && (
                  <a href={presentationUrl} download="ITP_Houston_Investor_Presentation.pdf" style={{display:"inline-flex",alignItems:"center",gap:6,background:NAVY,color:"white",border:"none",padding:"8px 16px",borderRadius:8,fontSize:12,fontWeight:600,textDecoration:"none",cursor:"pointer"}}>
                    <Download size={14}/> Download PDF
                  </a>
                )}
                <button onClick={()=>setShowPresentation(false)} style={{background:"none",border:"none",color:"#7A8B9A",cursor:"pointer",fontSize:14,fontWeight:600,padding:"8px 12px"}}>✕ Close</button>
              </div>
            </div>
            <div style={{flex:1,overflow:"auto",minHeight:0}}>
              {presentationUrl ? (
                <iframe src={presentationUrl} style={{width:"100%",height:"70vh",border:"none"}} title="Investor Presentation" />
              ) : (
                <div style={{padding:40,textAlign:"center",color:"#7A8B9A"}}>Your browser doesn't support inline PDF viewing. Click Download PDF above.</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{background:NAVY,padding:"20px 32px",textAlign:"center"}}>
        <div style={{color:"rgba(255,255,255,0.5)",fontSize:11}}>Powered by PLUSAdvantage™ 2026</div>
      </div>

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 1: DASHBOARD
// ═══════════════════════════════════════════════════════════════
function DashboardTab({model,params,updateParam}){
  const m=model;
  const lotTypeData=Object.entries(m.lotSummary).map(([type,d])=>({name:type,value:d.value,acres:d.acres,count:d.count}));
  const PIE_COLORS=[TEAL,TERRA,GOLD];
  const revenueByQ=[];
  for(let q=0;q<Math.ceil(NUM_MONTHS/3);q++){
    let lotRev=0,mudRev=0;
    for(let mo=q*3;mo<(q+1)*3&&mo<=NUM_MONTHS;mo++){lotRev+=m.lotRevenue[mo];mudRev+=m.mudRevenue[mo];}
    if(lotRev>0||mudRev>0)revenueByQ.push({q:`Q${q+1}`,lotRev,mudRev,total:lotRev+mudRev});
  }
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:24}}>
        <MetricCard label="Total Revenue" value={fmt(m.totalRev)} sub={`Lots: ${fmt(m.totalLotRev)} + MUD: ${fmt(m.totalMudRev)}`} accent={TEAL}/>
        <MetricCard label="Total Cost" value={fmt(m.totalCost)} sub={`Hard: ${fmt(m.totalHard)} | Soft: ${fmt(m.totalSoft)}`} accent={TERRA}/>
        <MetricCard label="Project Gross Margin" value={fmt(m.totalProfit)} sub="Before waterfall distribution" accent="#2E8B57"/>
        <MetricCard label="Project Multiple" value={((m.totalProfit/m.equity)+1).toFixed(2)+"x"} sub="Total return on deemed capital basis" accent={GOLD}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:24}}>
        <div>
          <SectionTitle>Revenue by Quarter</SectionTitle>
          <div style={{background:"white",borderRadius:12,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueByQ} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#E8ECF0"/>
                <XAxis dataKey="q" tick={{fontSize:11,fill:"#7A8B9A"}}/>
                <YAxis tick={{fontSize:11,fill:"#7A8B9A"}} tickFormatter={v=>fmt(v)}/>
                <Tooltip formatter={v=>fmtFull(v)}/>
                <Bar dataKey="lotRev" name="Lot Sales" fill={TEAL} radius={[4,4,0,0]}/>
                <Bar dataKey="mudRev" name="MUD Reimb." fill={GOLD} radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <SectionTitle>Cumulative Cash Flow</SectionTitle>
          <div style={{background:"white",borderRadius:12,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={m.monthlyCFData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8ECF0"/>
                <XAxis dataKey="month" tick={{fontSize:11,fill:"#7A8B9A"}}/>
                <YAxis tick={{fontSize:11,fill:"#7A8B9A"}} tickFormatter={v=>fmt(v)}/>
                <Tooltip formatter={v=>fmtFull(v)}/>
                <Area type="monotone" dataKey="cumCF" stroke={TEAL} fill={TEAL} fillOpacity={0.15} strokeWidth={2} name="Cumulative CF"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <SectionTitle>Scenario Controls</SectionTitle>
          <div style={{background:"white",borderRadius:12,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
            <SliderInput label="Equity / Deemed Capital" value={params.equity} onChange={v=>updateParam("equity",v)} min={5000000} max={20000000} step={100000} format={v=>fmt(v)}/>
            <SliderInput label="Preferred Return" value={params.prefReturn} onChange={v=>updateParam("prefReturn",v)} min={0.04} max={0.15} step={0.005} format={v=>pct(v)}/>
            <SliderInput label="Equity / Developer Split" value={params.equityPct} onChange={v=>{updateParam("equityPct",v);updateParam("devPct",+(1-v).toFixed(2));}} min={0.3} max={0.8} step={0.05} format={v=>`${pct(v)} / ${pct(1-v)}`}/>
            <SliderInput label="MUD Principal" value={params.mudTotal} onChange={v=>updateParam("mudTotal",v)} min={15000000} max={30000000} step={500000} format={v=>fmt(v)}/>
            <SliderInput label="Loan Rate" value={params.loanRate} onChange={v=>updateParam("loanRate",v)} min={0.06} max={0.15} step={0.005} format={v=>pct(v)}/>
          </div>
          <SectionTitle>Lot Mix by Type</SectionTitle>
          <div style={{background:"white",borderRadius:12,padding:16,boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart><Pie data={lotTypeData} cx="50%" cy="50%" outerRadius={75} innerRadius={40} dataKey="value" paddingAngle={3}>
                {lotTypeData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
              </Pie><Tooltip formatter={v=>fmtFull(v)}/></PieChart>
            </ResponsiveContainer>
            <div style={{display:"flex",justifyContent:"center",gap:16,flexWrap:"wrap"}}>
              {lotTypeData.map((d,i)=>(<div key={d.name} style={{display:"flex",alignItems:"center",gap:6,fontSize:11}}><div style={{width:10,height:10,borderRadius:2,background:PIE_COLORS[i]}}/><span style={{color:"#555"}}>{d.name} ({d.count})</span></div>))}
            </div>
          </div>
          <div style={{background:"white",borderRadius:12,padding:16,marginTop:16,boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
            <div style={{fontSize:12,fontWeight:600,color:NAVY,marginBottom:8}}>Returns Summary</div>
            {[
              {l:"Preferred Return (8%)",v:fmtFull(Math.round(m.eqTotalPref)),sub:"Accrued on equity capital deployed"},
              {l:"Equity Profit Share",v:fmtFull(Math.round(m.eqTotalFinal)),sub:pct(m.equityPct)+" of residual after capital + pref returned"},
              {l:"Developer Profit Share",v:fmtFull(Math.round(m.devNetProfit)),sub:pct(m.devPct)+" of residual after capital + pref returned"},
              {l:"Equity Total Profit",v:fmtFull(Math.round(m.eqTotalPref+m.eqTotalFinal)),sub:"Pref return + equity profit share"},
              {l:"Peak Loan Requirement",v:fmtFull(Math.round(m.peakLoan))},
            ].map((item)=>(
              <div key={item.l} style={{padding:"6px 0",borderBottom:"1px solid #F0F2F4"}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                  <span style={{color:"#7A8B9A"}}>{item.l}</span><span style={{fontWeight:700,color:NAVY}}>{item.v}</span>
                </div>
                {item.sub&&<div style={{fontSize:10,color:"#9AA5B0",marginTop:2}}>{item.sub}</div>}
              </div>))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 2: LOT SCHEDULE
// ═══════════════════════════════════════════════════════════════
function LotTab({lots,model,updateLot}){
  const TC={Industrial:TEAL,Retail:TERRA,Multifamily:GOLD};
  return(<div>
    <SectionTitle icon="\ud83d\udccb">Lot Value & Sales Schedule</SectionTitle>
    <div style={{fontSize:12,color:"#7A8B9A",marginBottom:12}}>Adjust sale month for each lot. All downstream financials update in real time.</div>
    <div style={{background:"white",borderRadius:12,boxShadow:"0 1px 3px rgba(0,0,0,0.08)",overflow:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead><tr style={{background:NAVY}}>
          {["Lot","Type","Acres","Net SF","$/SF","Gross Value","Net Value","Sale Mo."].map(h=>(<th key={h} style={{padding:"10px 12px",color:"white",fontWeight:600,textAlign:"left",whiteSpace:"nowrap",fontSize:11}}>{h}</th>))}
        </tr></thead>
        <tbody>
          {model.lotsCalc.map((l,i)=>(<tr key={l.id} style={{background:i%2?"#FAFBFC":"white",borderBottom:"1px solid #F0F2F4"}}>
            <td style={{padding:"8px 12px",fontWeight:600}}>{l.id}</td>
            <td style={{padding:"8px 12px"}}><span style={{background:TC[l.type]+"18",color:TC[l.type],padding:"2px 8px",borderRadius:4,fontWeight:600,fontSize:11}}>{l.type}</span></td>
            <td style={{padding:"8px 12px"}}>{l.acres.toFixed(2)}</td>
            <td style={{padding:"8px 12px"}}>{l.sf.toLocaleString("en-US",{maximumFractionDigits:0})}</td>
            <td style={{padding:"8px 12px"}}>${l.asking.toFixed(2)}</td>
            <td style={{padding:"8px 12px",fontFamily:"Georgia,serif"}}>{fmtFull(l.gross)}</td>
            <td style={{padding:"8px 12px",fontWeight:700,color:NAVY,fontFamily:"Georgia,serif"}}>{fmtFull(l.net)}</td>
            <td style={{padding:"4px 12px"}}><input type="number" value={l.saleMonth} min={1} max={NUM_MONTHS} onChange={e=>updateLot(l.id,parseInt(e.target.value)||1)} style={{width:52,padding:"4px 6px",border:`1.5px solid ${STEEL}`,borderRadius:4,fontSize:12,fontWeight:700,color:TEAL,textAlign:"center",outline:"none",background:"#FFFDE7"}}/></td>
          </tr>))}
          <tr style={{background:LIGHT,fontWeight:700}}>
            <td style={{padding:"10px 12px"}}>Total</td><td style={{padding:"10px 12px"}}>{lots.length} lots</td>
            <td style={{padding:"10px 12px"}}>{model.lotsCalc.reduce((a,l)=>a+l.acres,0).toFixed(2)}</td>
            <td style={{padding:"10px 12px"}}>{model.lotsCalc.reduce((a,l)=>a+l.sf,0).toLocaleString("en-US",{maximumFractionDigits:0})}</td><td/>
            <td style={{padding:"10px 12px",fontFamily:"Georgia,serif"}}>{fmtFull(model.lotsCalc.reduce((a,l)=>a+l.gross,0))}</td>
            <td style={{padding:"10px 12px",color:NAVY,fontFamily:"Georgia,serif"}}>{fmtFull(model.totalLotRev)}</td><td/>
          </tr>
        </tbody>
      </table>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginTop:24}}>
      {Object.entries(model.lotSummary).map(([type,d])=>(<div key={type} style={{background:"white",borderRadius:12,padding:20,borderTop:`4px solid ${TC[type]}`,boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
        <div style={{fontSize:14,fontWeight:700,color:NAVY}}>{type}</div>
        <div style={{fontSize:24,fontWeight:700,color:TC[type],fontFamily:"Georgia,serif",margin:"8px 0"}}>{fmtFull(d.value)}</div>
        <div style={{fontSize:12,color:"#7A8B9A"}}>{d.count} lots &nbsp;|&nbsp; {d.acres.toFixed(1)} acres</div>
      </div>))}
    </div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════
// TAB 3: CASH FLOWS
// ═══════════════════════════════════════════════════════════════
function CashFlowTab({model}){
  const m=model;
  return(<div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:8}}>
      <MetricCard label="Total Revenue" value={fmt(m.totalRev)} accent={TEAL}/>
      <MetricCard label="Hard Costs" value={fmt(m.totalHard)} accent={TERRA}/>
      <MetricCard label="Soft Costs" value={fmt(m.totalSoft)} accent={GOLD}/>
      <MetricCard label="Peak Loan" value={fmtFull(Math.round(m.peakLoan))} accent="#E85D75"/>
    </div>
    <SectionTitle>Monthly Revenue vs. Costs</SectionTitle>
    <div style={{background:"white",borderRadius:12,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={m.monthlyCFData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8ECF0"/>
          <XAxis dataKey="month" tick={{fontSize:11,fill:"#7A8B9A"}}/>
          <YAxis tick={{fontSize:11,fill:"#7A8B9A"}} tickFormatter={v=>fmt(v)}/>
          <Tooltip formatter={v=>fmtFull(Math.round(v))}/>
          <Legend wrapperStyle={{fontSize:11}}/>
          <Bar dataKey="revenue" name="Revenue" fill={TEAL} opacity={0.7} radius={[3,3,0,0]}/>
          <Bar dataKey="cost" name="Costs" fill={TERRA} opacity={0.7} radius={[3,3,0,0]}/>
          <Line type="monotone" dataKey="cumCF" name="Cumulative CF" stroke={NAVY} strokeWidth={2} dot={false}/>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
    <SectionTitle>Infrastructure Cost Breakdown</SectionTitle>
    <div style={{background:"white",borderRadius:12,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
      {HARD_COSTS.map(c=>{const p=c.total/m.totalHard;return(
        <div key={c.name} style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
            <span style={{fontWeight:600,color:NAVY}}>{c.name}</span>
            <span style={{color:"#7A8B9A"}}>{fmtFull(c.total)} &nbsp;|&nbsp; Mo {c.start}\u2013{c.start+c.dur-1}</span>
          </div>
          <div style={{background:"#F0F2F4",borderRadius:4,height:8,overflow:"hidden"}}>
            <div style={{width:`${p*100}%`,height:"100%",background:`linear-gradient(90deg,${TEAL},${STEEL})`,borderRadius:4}}/>
          </div>
        </div>);})}
    </div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════
// TAB 4: CAPITAL STACK (NEW — Deemed Capital Story)
// ═══════════════════════════════════════════════════════════════
function CapitalStackTab({model,params}){
  const m=model;
  const stackData=[
    {name:"Land Acquisition",value:3685051,fill:NAVY},
    {name:"Project Expenditures",value:4540432,fill:TEAL},
    {name:"Accrued Pref Return (8%)",value:3161805,fill:GOLD},
    {name:"Deemed Capital Basis",value:0,fill:"transparent"},
  ];
  const totalDeemed=DEEMED_CAPITAL_TOTAL;
  return(<div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginBottom:24}}>
      <MetricCard label="Land Acquisition" value={fmtFull(3685051)} sub="Original purchase (June 2019)" accent={NAVY}/>
      <MetricCard label="Project Expenditures" value={fmtFull(4540432)} sub="Development costs (2019\u20132026)" accent={TEAL}/>
      <MetricCard label="Accrued Preferred Return" value={fmtFull(3161805)} sub="8% simple interest on deployed capital" accent={GOLD}/>
      <MetricCard label="Total Deemed Capital" value={fmtFull(Math.round(totalDeemed))} sub="Equity partner\u2019s capital basis" accent={TERRA}/>
    </div>
    <SectionTitle>Capital Structure — Deemed Capital Basis</SectionTitle>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
      <div style={{background:"white",borderRadius:12,padding:24,boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
        <div style={{fontSize:14,fontWeight:700,color:NAVY,marginBottom:16}}>How the Equity Basis Was Built</div>
        <div style={{fontSize:13,color:"#555",lineHeight:1.7,marginBottom:20}}>
          The equity partner\u2019s capital basis is not a negotiated number \u2014 it is the sum of actual capital deployed into the project since land acquisition in June 2019, plus accrued preferred return at 8% simple interest on each expenditure from its date of deployment through the project start date.
        </div>
        <div style={{marginBottom:8}}>
          {[["Land Acquisition (June 2019)","$3,685,051",NAVY],["Project Expenditures (2019\u20132026)","$4,540,432",TEAL],["Accrued Preferred Return (8%)","$3,161,805",GOLD]].map(([l,v,c])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #F0F2F4"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:12,height:12,borderRadius:3,background:c}}/>
                <span style={{fontSize:13,color:"#555"}}>{l}</span>
              </div>
              <span style={{fontSize:13,fontWeight:700,color:NAVY,fontFamily:"Georgia,serif"}}>{v}</span>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderTop:`2px solid ${NAVY}`,marginTop:4}}>
            <span style={{fontSize:14,fontWeight:700,color:NAVY}}>Total Deemed Capital</span>
            <span style={{fontSize:16,fontWeight:700,color:TERRA,fontFamily:"Georgia,serif"}}>{fmtFull(Math.round(totalDeemed))}</span>
          </div>
        </div>
      </div>
      <div style={{background:"white",borderRadius:12,padding:24,boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
        <div style={{fontSize:14,fontWeight:700,color:NAVY,marginBottom:16}}>Forward Capital Plan</div>
        {[
          ["Deemed Capital (Equity Basis)",fmtFull(Math.round(totalDeemed)),TERRA],
          ["MUD Bond Reimbursements",fmtFull(params.mudTotal),GOLD],
          ["Infrastructure Loan (Peak)",fmtFull(Math.round(m.peakLoan)),"#E85D75"],
          ["Total Revenue Capacity",fmtFull(Math.round(m.totalRev)),TEAL],
          ["Project Gross Margin",fmtFull(Math.round(m.totalProfit)),"#2E8B57"],
        ].map(([l,v,c])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #F0F2F4"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:12,height:12,borderRadius:3,background:c}}/>
              <span style={{fontSize:13,color:"#555"}}>{l}</span>
            </div>
            <span style={{fontSize:13,fontWeight:700,color:NAVY,fontFamily:"Georgia,serif"}}>{v}</span>
          </div>
        ))}
        <div style={{marginTop:16,padding:16,background:LIGHT,borderRadius:8,fontSize:12,color:"#555",lineHeight:1.6}}>
          <strong style={{color:NAVY}}>Profit Split:</strong> {pct(params.equityPct)} Equity Partner / {pct(params.devPct)} Developer<br/>
          <strong style={{color:NAVY}}>Preferred Return:</strong> {fmtFull(Math.round(m.eqTotalPref))} <span style={{fontSize:10,color:"#7A8B9A"}}>(8% accrued on equity capital)</span><br/>
          <strong style={{color:NAVY}}>Equity Profit Share:</strong> {fmtFull(Math.round(m.eqTotalFinal))} <span style={{fontSize:10,color:"#7A8B9A"}}>({pct(params.equityPct)} of residual after capital + pref)</span><br/>
          <strong style={{color:NAVY}}>Developer Profit Share:</strong> {fmtFull(Math.round(m.devNetProfit))} <span style={{fontSize:10,color:"#7A8B9A"}}>({pct(params.devPct)} of residual after capital + pref)</span>
        </div>
      </div>
    </div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════
// TAB 5: EQUITY WATERFALL
// ═══════════════════════════════════════════════════════════════
function WaterfallTab({model,params,updateParam}){
  const m=model;
  const wfData=[{name:"Equity In",value:-m.eqTotalContrib,fill:"#E85D75"},{name:"Pref Return",value:m.eqTotalPref,fill:GOLD},{name:"Capital Return",value:Math.max(0,m.eqTotalDist-m.eqTotalPref),fill:TEAL},{name:"Equity Share",value:m.eqTotalFinal,fill:STEEL},{name:"Dev Share",value:m.devNetProfit,fill:TERRA}];
  return(<div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:8}}>
      <MetricCard label="Deemed Capital Basis" value={fmt(params.equity)} sub="Initial equity contribution" accent="#E85D75"/>
      <MetricCard label="Preferred Return" value={fmtFull(Math.round(m.eqTotalPref))} sub={pct(params.prefReturn)+" annual (accrued)"} accent={GOLD}/>
      <MetricCard label="Equity Profit Share" value={fmtFull(Math.round(m.eqTotalFinal))} sub={pct(params.equityPct)+" of residual"} accent={TEAL}/>
      <MetricCard label="Developer Profit Share" value={fmtFull(Math.round(m.devNetProfit))} sub={pct(params.devPct)+" of residual"} accent={TERRA}/>
      <MetricCard label="Equity Multiple" value={m.eqMultiple.toFixed(2)+"x"} accent={NAVY}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:24}}>
      <div>
        <SectionTitle>Distribution Waterfall</SectionTitle>
        <div style={{background:"white",borderRadius:12,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={wfData} layout="vertical" barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8ECF0"/>
              <XAxis type="number" tick={{fontSize:11,fill:"#7A8B9A"}} tickFormatter={v=>fmt(v)}/>
              <YAxis type="category" dataKey="name" tick={{fontSize:12,fill:NAVY,fontWeight:600}} width={100}/>
              <Tooltip formatter={v=>fmtFull(Math.round(v))}/>
              <Bar dataKey="value" radius={[0,6,6,0]}>{wfData.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div>
        <SectionTitle>Waterfall Terms</SectionTitle>
        <div style={{background:"white",borderRadius:12,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
          <SliderInput label="Equity Contribution" value={params.equity} onChange={v=>updateParam("equity",v)} min={5000000} max={20000000} step={100000} format={v=>fmt(v)}/>
          <SliderInput label="Preferred Return" value={params.prefReturn} onChange={v=>updateParam("prefReturn",v)} min={0.04} max={0.15} step={0.005} format={v=>pct(v)}/>
          <SliderInput label="Equity / Developer Split" value={params.equityPct} onChange={v=>{updateParam("equityPct",v);updateParam("devPct",+(1-v).toFixed(2));}} min={0.3} max={0.8} step={0.05} format={v=>`${pct(v)} / ${pct(1-v)}`}/>
        </div>
        <div style={{background:"white",borderRadius:12,padding:20,marginTop:16,boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
          <div style={{fontSize:13,fontWeight:700,color:NAVY,marginBottom:12}}>Waterfall Distribution</div>
          {[
            {l:"TIER 1 — Return of Capital",v:"",header:true},
            {l:"  Capital Invested",v:fmtFull(Math.round(m.eqTotalContrib))},
            {l:"  Capital Returned",v:fmtFull(Math.round(Math.min(m.eqTotalDist,m.eqTotalContrib))),sub:"Return OF capital (not profit)"},
            {l:"",v:"",spacer:true},
            {l:"TIER 2 — Preferred Return ("+pct(params.prefReturn)+")",v:"",header:true},
            {l:"  Pref Accrued",v:fmtFull(Math.round(m.eqTotalPref))},
            {l:"  Pref Paid",v:fmtFull(Math.round(Math.min(Math.max(0,m.eqTotalDist-m.eqTotalContrib),m.eqTotalPref)))},
            {l:"",v:"",spacer:true},
            {l:"TIER 3 — Profit Split ("+pct(params.equityPct)+"/"+pct(params.devPct)+")",v:"",header:true},
            {l:"  Equity Profit Share",v:fmtFull(Math.round(m.eqTotalFinal)),sub:pct(params.equityPct)+" of residual after capital + pref"},
            {l:"  Developer Profit Share",v:fmtFull(Math.round(m.devNetProfit)),sub:pct(params.devPct)+" of residual after capital + pref"},
            {l:"",v:"",spacer:true},
            {l:"TOTALS",v:"",header:true},
            {l:"  Equity Total Return",v:fmtFull(Math.round(m.eqTotalDist+m.eqTotalFinal)),sub:"Capital back + pref + profit share"},
            {l:"  Equity Total Profit",v:fmtFull(Math.round(m.eqTotalPref+m.eqTotalFinal)),sub:"Pref return + equity profit share"},
            {l:"  Developer Total Profit",v:fmtFull(Math.round(m.devNetProfit)),sub:"Profit share only (no capital at risk)"},
            {l:"  Equity Multiple",v:m.eqMultiple.toFixed(2)+"x"},
          ].map((item,i)=>(
            item.spacer?<div key={i} style={{height:8}}/>:
            <div key={i} style={{padding:"5px 0",borderBottom:item.v||item.header?"1px solid #F0F2F4":"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:item.header?700:400,color:item.header?NAVY:"#555"}}>
                <span>{item.l}</span><span style={{fontWeight:600,color:NAVY}}>{item.v}</span>
              </div>
              {item.sub&&<div style={{fontSize:10,color:"#9AA5B0",marginTop:1,paddingLeft:12}}>{item.sub}</div>}
            </div>))}
        </div>
      </div>
    </div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════
// TAB 6: EXPENDITURES (Full Historical Record)
// ═══════════════════════════════════════════════════════════════
function ExpendituresTab(){
  const [unlocked,setUnlocked]=useState(false);
  const [code,setCode]=useState("");
  const [error,setError]=useState(false);
  const [filter,setFilter]=useState("All");
  const years=[...new Set(EXPENDITURES.map(e=>e.d?e.d.substring(0,4):"2019"))].sort();
  const filtered=filter==="All"?EXPENDITURES:EXPENDITURES.filter(e=>(e.d||"2019").startsWith(filter));
  const total=filtered.reduce((a,e)=>a+e.a,0);
  let running=0;

  if(!unlocked){
    return(<div style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:400}}>
      <div style={{background:"white",borderRadius:16,padding:40,boxShadow:"0 4px 24px rgba(0,0,0,0.12)",textAlign:"center",maxWidth:380,width:"100%"}}>
        <div style={{fontSize:32,marginBottom:12}}>🔒</div>
        <div style={{fontSize:18,fontWeight:700,color:NAVY,marginBottom:4}}>Secure Data</div>
        <div style={{fontSize:13,color:"#7A8B9A",marginBottom:24}}>Enter the access code to view Expenditures.</div>
        <input
          type="password"
          value={code}
          onChange={e=>{setCode(e.target.value);setError(false);}}
          onKeyDown={e=>{if(e.key==="Enter"){if(code.toUpperCase()==="ITPH"){setUnlocked(true);}else{setError(true);setCode("");}}}}
          placeholder="Access Code"
          style={{width:"100%",padding:"12px 16px",borderRadius:8,border:`2px solid ${error?"#E85D75":"#D0D7DE"}`,fontSize:14,textAlign:"center",letterSpacing:4,marginBottom:12,outline:"none",boxSizing:"border-box"}}
        />
        {error&&<div style={{fontSize:12,color:"#E85D75",marginBottom:12}}>Invalid code. Please try again.</div>}
        <button onClick={()=>{if(code.toUpperCase()==="ITPH"){setUnlocked(true);}else{setError(true);setCode("");}}} style={{width:"100%",padding:"12px",borderRadius:8,background:NAVY,color:"white",fontSize:14,fontWeight:600,border:"none",cursor:"pointer"}}>Unlock</button>
      </div>
    </div>);
  }

  return(<div>
    <SectionTitle>Project Expenditures — Full Historical Record</SectionTitle>
    <div style={{fontSize:12,color:"#7A8B9A",marginBottom:16}}>Complete record of all capital deployed into ITP Houston since land acquisition (June 2019). {EXPENDITURES.length} line items totaling {fmtFull(Math.round(EXPENDITURES.reduce((a,e)=>a+e.a,0)))}.</div>
    <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
      {["All",...years].map(y=>(<button key={y} onClick={()=>setFilter(y)} style={{padding:"6px 14px",borderRadius:6,border:`1.5px solid ${filter===y?TEAL:"#D0D7DE"}`,background:filter===y?TEAL:"white",color:filter===y?"white":NAVY,fontSize:11,fontWeight:600,cursor:"pointer"}}>{y}{y!=="All"?` (${EXPENDITURES.filter(e=>(e.d||"2019").startsWith(y)).length})`:""}</button>))}
    </div>
    <div style={{background:"white",borderRadius:12,boxShadow:"0 1px 3px rgba(0,0,0,0.08)",overflow:"auto",maxHeight:500}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
        <thead><tr style={{background:NAVY,position:"sticky",top:0,zIndex:1}}>
          {["#","Date","Description","Amount","Running Total"].map(h=>(<th key={h} style={{padding:"8px 10px",color:"white",fontWeight:600,textAlign:h==="Amount"||h==="Running Total"?"right":"left",fontSize:11}}>{h}</th>))}
        </tr></thead>
        <tbody>
          {filtered.map((e,i)=>{running+=e.a;return(
            <tr key={i} style={{background:i%2?"#FAFBFC":"white",borderBottom:"1px solid #EEF1F4"}}>
              <td style={{padding:"5px 10px",color:"#999"}}>{i+1}</td>
              <td style={{padding:"5px 10px",whiteSpace:"nowrap"}}>{e.d||"—"}</td>
              <td style={{padding:"5px 10px",maxWidth:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.n}</td>
              <td style={{padding:"5px 10px",textAlign:"right",fontFamily:"Georgia,serif",fontWeight:600}}>{fmtFull(Math.round(e.a))}</td>
              <td style={{padding:"5px 10px",textAlign:"right",fontFamily:"Georgia,serif",color:"#7A8B9A"}}>{fmtFull(Math.round(running))}</td>
            </tr>);})}
          <tr style={{background:LIGHT,fontWeight:700,position:"sticky",bottom:0}}>
            <td colSpan={3} style={{padding:"10px",fontSize:12,color:NAVY}}>Total ({filtered.length} items)</td>
            <td style={{padding:"10px",textAlign:"right",fontFamily:"Georgia,serif",color:NAVY,fontSize:13}}>{fmtFull(Math.round(total))}</td>
            <td/>
          </tr>
        </tbody>
      </table>
    </div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════
// TAB 7: DEEMED CAPITAL (Interest Accrual Calculation)
// ═══════════════════════════════════════════════════════════════
function DeemedCapitalTab(){
  const [unlocked,setUnlocked]=useState(false);
  const [code,setCode]=useState("");
  const [error,setError]=useState(false);
  const totalExp=DEEMED_CAPITAL_ITEMS.reduce((a,d)=>a+d.a,0);
  const totalPref=DEEMED_CAPITAL_ITEMS.reduce((a,d)=>a+d.p,0);
  const totalDeemed=totalExp+totalPref;
  let runAmt=0,runPref=0;

  if(!unlocked){
    return(<div style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:400}}>
      <div style={{background:"white",borderRadius:16,padding:40,boxShadow:"0 4px 24px rgba(0,0,0,0.12)",textAlign:"center",maxWidth:380,width:"100%"}}>
        <div style={{fontSize:32,marginBottom:12}}>🔒</div>
        <div style={{fontSize:18,fontWeight:700,color:NAVY,marginBottom:4}}>Secure Data</div>
        <div style={{fontSize:13,color:"#7A8B9A",marginBottom:24}}>Enter the access code to view Deemed Capital.</div>
        <input type="password" value={code} onChange={e=>{setCode(e.target.value);setError(false);}} onKeyDown={e=>{if(e.key==="Enter"){if(code.toUpperCase()==="ITPH"){setUnlocked(true);}else{setError(true);setCode("");}}}} placeholder="Access Code" style={{width:"100%",padding:"12px 16px",borderRadius:8,border:`2px solid ${error?"#E85D75":"#D0D7DE"}`,fontSize:14,textAlign:"center",letterSpacing:4,marginBottom:12,outline:"none",boxSizing:"border-box"}}/>
        {error&&<div style={{fontSize:12,color:"#E85D75",marginBottom:12}}>Invalid code. Please try again.</div>}
        <button onClick={()=>{if(code.toUpperCase()==="ITPH"){setUnlocked(true);}else{setError(true);setCode("");}}} style={{width:"100%",padding:"12px",borderRadius:8,background:NAVY,color:"white",fontSize:14,fontWeight:600,border:"none",cursor:"pointer"}}>Unlock</button>
      </div>
    </div>);
  }

  return(<div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginBottom:24}}>
      <MetricCard label="Total Expenditures" value={fmtFull(Math.round(totalExp))} sub={`${DEEMED_CAPITAL_ITEMS.length} capital deployments`} accent={TEAL}/>
      <MetricCard label="Accrued Preferred Return" value={fmtFull(Math.round(totalPref))} sub="8% simple interest from date of deploy" accent={GOLD}/>
      <MetricCard label="Deemed Capital Basis" value={fmtFull(Math.round(totalDeemed))} sub="Equity partner's capital account" accent={TERRA}/>
    </div>
    <SectionTitle icon="\ud83d\udcca">Deemed Capital Calculation — Interest Accrual Detail</SectionTitle>
    <div style={{fontSize:12,color:"#7A8B9A",marginBottom:16}}>Each expenditure accrues 8% simple annual interest from its deployment date through the project start date (Feb 28, 2026). The sum of principal + accrued interest = the Deemed Capital basis.</div>
    <div style={{background:"white",borderRadius:12,boxShadow:"0 1px 3px rgba(0,0,0,0.08)",overflow:"auto",maxHeight:500}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
        <thead><tr style={{background:NAVY,position:"sticky",top:0,zIndex:1}}>
          {["#","Date","Amount","Days","Rate","Pref Return","Cumulative"].map(h=>(<th key={h} style={{padding:"8px 10px",color:"white",fontWeight:600,textAlign:["Amount","Days","Pref Return","Cumulative"].includes(h)?"right":"left",fontSize:11}}>{h}</th>))}
        </tr></thead>
        <tbody>
          {DEEMED_CAPITAL_ITEMS.map((d,i)=>{runAmt+=d.a;runPref+=d.p;return(
            <tr key={i} style={{background:i%2?"#FAFBFC":"white",borderBottom:"1px solid #EEF1F4"}}>
              <td style={{padding:"5px 10px",color:"#999"}}>{i+1}</td>
              <td style={{padding:"5px 10px",whiteSpace:"nowrap"}}>{d.d}</td>
              <td style={{padding:"5px 10px",textAlign:"right",fontFamily:"Georgia,serif"}}>{fmtFull(Math.round(d.a))}</td>
              <td style={{padding:"5px 10px",textAlign:"right"}}>{d.dy}</td>
              <td style={{padding:"5px 10px",textAlign:"center"}}>8.0%</td>
              <td style={{padding:"5px 10px",textAlign:"right",fontFamily:"Georgia,serif",color:GOLD}}>{fmtFull(Math.round(d.p))}</td>
              <td style={{padding:"5px 10px",textAlign:"right",fontFamily:"Georgia,serif",color:"#7A8B9A"}}>{fmtFull(Math.round(runAmt+runPref))}</td>
            </tr>);})}
          <tr style={{background:LIGHT,fontWeight:700,position:"sticky",bottom:0}}>
            <td colSpan={2} style={{padding:"10px",fontSize:12,color:NAVY}}>Total ({DEEMED_CAPITAL_ITEMS.length} items)</td>
            <td style={{padding:"10px",textAlign:"right",fontFamily:"Georgia,serif",color:NAVY}}>{fmtFull(Math.round(totalExp))}</td>
            <td colSpan={2}/>
            <td style={{padding:"10px",textAlign:"right",fontFamily:"Georgia,serif",color:GOLD}}>{fmtFull(Math.round(totalPref))}</td>
            <td style={{padding:"10px",textAlign:"right",fontFamily:"Georgia,serif",color:TERRA,fontSize:13}}>{fmtFull(Math.round(totalDeemed))}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════
// TAB 8: FINANCIAL MODEL (Spreadsheet Viewer)
// ═══════════════════════════════════════════════════════════════
const SHEETS=["Dashboard","Lots","Assumptions","Monthly Cash Flows","Equity Waterfall"];
function SpreadsheetTab({model,params}){
  const [sheet,setSheet]=useState(0);
  const m=model;
  const f=n=>typeof n==="number"?(Math.abs(n)<0.005?"\u2014":n.toLocaleString("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0})):n;
  const fp=n=>typeof n==="number"?(n*100).toFixed(1)+"%":n;
  const cs=(hdr,lbl,tot,neg)=>({padding:hdr?"8px 10px":"5px 10px",fontSize:11,fontWeight:hdr||tot?700:lbl?600:400,color:hdr?"white":neg?"#C0392B":tot?NAVY:lbl?NAVY:"#333",background:hdr?NAVY:tot?LIGHT:"transparent",borderBottom:tot?`2px solid ${STEEL}`:"1px solid #EEF1F4",whiteSpace:"nowrap",textAlign:hdr||lbl?"left":"right",fontFamily:lbl||hdr?"Calibri,sans-serif":"Georgia,serif"});
  const ml=[];const sd=new Date(2026,1,28);
  for(let i=0;i<=NUM_MONTHS;i++){const d=new Date(sd);d.setMonth(d.getMonth()+i);ml.push(d.toLocaleDateString("en-US",{month:"short",year:"2-digit"}));}
  const am=[];for(let i=0;i<=NUM_MONTHS;i++){if(m.totalRevenue[i]!==0||m.unleveredCost[i]!==0||m.leveredCF[i]!==0||m.eqEnd[i]!==0)am.push(i);}
  const minM=Math.max(0,am[0]||0),maxM=Math.min(NUM_MONTHS,(am[am.length-1]||NUM_MONTHS)+1);
  const rng=[];for(let i=minM;i<=maxM;i++)rng.push(i);

  const [modelFileUrl, setModelFileUrl] = useState(null);
  const [opcFileUrl, setOpcFileUrl] = useState(null);
  const [modelUpdated, setModelUpdated] = useState(null);
  const [opcUpdated, setOpcUpdated] = useState(null);

  useEffect(() => {
    async function checkFiles() {
      const { data: modelDoc } = await supabase.from("vault_documents").select("file_path, uploaded_at").eq("name", "ITPH Financial Model v9.xlsx").maybeSingle();
      if (modelDoc) {
        const { data: urlData } = supabase.storage.from("itph-data-vault").getPublicUrl(modelDoc.file_path);
        setModelFileUrl(urlData.publicUrl);
        setModelUpdated(modelDoc.uploaded_at);
      }
      const { data: opcDoc } = await supabase.from("vault_documents").select("file_path, uploaded_at").eq("name", "OPC Breakdown.xlsx").maybeSingle();
      if (opcDoc) {
        const { data: urlData } = supabase.storage.from("itph-data-vault").getPublicUrl(opcDoc.file_path);
        setOpcFileUrl(urlData.publicUrl);
        setOpcUpdated(opcDoc.uploaded_at);
      }
    }
    checkFiles();
  }, []);

  return(<div>
    <div style={{display:"flex",gap:12,marginBottom:20,alignItems:"flex-start",flexWrap:"wrap"}}>
      <div>
        {modelFileUrl ? (
          <a href={modelFileUrl} download style={{display:"inline-flex",alignItems:"center",gap:8,background:NAVY,color:"white",padding:"12px 24px",borderRadius:12,fontWeight:600,fontSize:13,textDecoration:"none",cursor:"pointer",border:"none"}}>
            <ArrowDownToLine size={16}/> Download Excel Model (ITPH v9)
          </a>
        ) : (
          <button disabled title="File not yet uploaded — use Data Vault to upload" style={{display:"inline-flex",alignItems:"center",gap:8,background:"#B0BEC5",color:"white",padding:"12px 24px",borderRadius:12,fontWeight:600,fontSize:13,border:"none",cursor:"not-allowed",opacity:0.7}}>
            <ArrowDownToLine size={16}/> Download Excel Model (ITPH v9)
          </button>
        )}
        <div style={{fontSize:11,color:"#7A8B9A",marginTop:4}}>Full working Excel model with all formulas — ITPH Financial Model v9</div>
        {modelUpdated && <div style={{fontSize:10,color:"#9AA5B0",marginTop:2}}>Last updated: {new Date(modelUpdated).toLocaleDateString()}</div>}
      </div>
      <div>
        {opcFileUrl ? (
          <a href={opcFileUrl} download style={{display:"inline-flex",alignItems:"center",gap:8,background:"white",color:NAVY,padding:"12px 24px",borderRadius:12,fontWeight:600,fontSize:13,textDecoration:"none",cursor:"pointer",border:"2px solid "+NAVY}}>
            <Download size={16}/> Download OPC Breakdown
          </a>
        ) : (
          <button disabled title="File not yet uploaded — use Data Vault to upload" style={{display:"inline-flex",alignItems:"center",gap:8,background:"white",color:"#B0BEC5",padding:"12px 24px",borderRadius:12,fontWeight:600,fontSize:13,border:"2px solid #B0BEC5",cursor:"not-allowed",opacity:0.7}}>
            <Download size={16}/> Download OPC Breakdown
          </button>
        )}
        {opcUpdated && <div style={{fontSize:10,color:"#9AA5B0",marginTop:6}}>Last updated: {new Date(opcUpdated).toLocaleDateString()}</div>}
      </div>
    </div>

    <SectionTitle icon={"\ud83d\udcc1"}>Financial Model — Live Spreadsheet View</SectionTitle>
    <div style={{fontSize:12,color:"#7A8B9A",marginBottom:16}}>All values recalculate in real time as you adjust inputs on other tabs.</div>
    <div style={{display:"flex",gap:2,marginBottom:0}}>
      {SHEETS.map((s,i)=>(<button key={s} onClick={()=>setSheet(i)} style={{padding:"8px 16px",border:"1px solid #D0D7DE",borderBottom:sheet===i?"2px solid white":"1px solid #D0D7DE",borderRadius:"6px 6px 0 0",cursor:"pointer",fontSize:11,fontWeight:600,background:sheet===i?"white":"#F6F8FA",color:sheet===i?NAVY:"#7A8B9A",marginBottom:sheet===i?-1:0,position:"relative",zIndex:sheet===i?1:0}}>{s}</button>))}
    </div>
    <div style={{background:"white",border:"1px solid #D0D7DE",borderRadius:"0 8px 8px 8px",boxShadow:"0 1px 3px rgba(0,0,0,0.08)",overflow:"auto",maxHeight:600}}>
      {sheet===0&&<SSDash m={m} f={f} fp={fp} cs={cs}/>}
      {sheet===1&&<SSLots m={m} f={f} cs={cs}/>}
      {sheet===2&&<SSAssum m={m} params={params} f={f} fp={fp} cs={cs}/>}
      {sheet===3&&<SSCF m={m} f={f} cs={cs} ml={ml} rng={rng}/>}
      {sheet===4&&<SSEWF m={m} f={f} cs={cs} ml={ml} rng={rng}/>}
    </div>
  </div>);
}

function SSDash({m,f,fp,cs}){
  const rows=[["Key Metrics",null,1],["Peak Loan Requirement",f(m.peakLoan)],["Total Project Revenue",f(m.totalRev)],["Total Project Cost",f(m.totalCost)],["Project Gross Margin",f(m.totalProfit),0,1],["Margin % (Return on Equity)",fp(m.totalProfit/m.equity)],["Project Multiple",((m.totalProfit/m.equity)+1).toFixed(2)+"x"],[null],["Waterfall Distribution",null,1],["Preferred Return (8%)",f(m.eqTotalPref)],["Equity Profit Share ("+((m.equityPct*100).toFixed(0))+"%)",f(m.eqTotalFinal)],["Developer Profit Share ("+((m.devPct*100).toFixed(0))+"%)",f(m.devNetProfit)],["Equity Total Profit (pref + share)",f(m.eqTotalPref+m.eqTotalFinal),0,1]];
  return(<table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr><th style={{...cs(1),width:280}}>ITP Houston Project Briefing</th><th style={{...cs(1),width:180}}>Results</th><th style={cs(1)}/></tr></thead><tbody>
    {rows.map((r,i)=>!r[0]?<tr key={i}><td colSpan={3} style={{height:12}}/></tr>:r[2]?<tr key={i}><td colSpan={3} style={{...cs(0,1),background:LIGHT,fontWeight:700,fontSize:12,padding:"10px 10px"}}>{r[0]}</td></tr>:<tr key={i}><td style={cs(0,1,r[3])}>{r[0]}</td><td style={{...cs(0,0,r[3]),textAlign:"right",fontWeight:700}}>{r[1]}</td><td style={cs(0)}/></tr>)}
  </tbody></table>);
}

function SSLots({m,f,cs}){
  const TBG={Industrial:"#E8F4F8",Retail:"#FFF3E8",Multifamily:"#FFF8E1"};
  return(<table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>
    {["Lot","Type","Acres","Net SF","$/SF","Gross","Net","Mo"].map(h=><th key={h} style={cs(1)}>{h}</th>)}
  </tr></thead><tbody>
    {m.lotsCalc.map((l,i)=><tr key={l.id} style={{background:i%2?"#FAFBFC":"white"}}><td style={cs(0,1)}>{l.id}</td><td style={{...cs(0),background:TBG[l.type],fontWeight:600,color:NAVY}}>{l.type}</td><td style={{...cs(0),textAlign:"right"}}>{l.acres.toFixed(2)}</td><td style={{...cs(0),textAlign:"right"}}>{l.sf.toLocaleString("en-US",{maximumFractionDigits:0})}</td><td style={{...cs(0),textAlign:"right"}}>${l.asking.toFixed(2)}</td><td style={{...cs(0),textAlign:"right"}}>{f(l.gross)}</td><td style={{...cs(0),textAlign:"right",fontWeight:700}}>{f(l.net)}</td><td style={{...cs(0),textAlign:"center",color:"blue",background:"#FFFDE7"}}>{l.saleMonth}</td></tr>)}
    <tr style={{background:LIGHT}}><td style={cs(0,1,1)}>Total</td><td style={cs(0,0,1)}>{m.lotsCalc.length}</td><td style={{...cs(0,0,1),textAlign:"right"}}>{m.lotsCalc.reduce((a,l)=>a+l.acres,0).toFixed(2)}</td><td style={{...cs(0,0,1),textAlign:"right"}}>{m.lotsCalc.reduce((a,l)=>a+l.sf,0).toLocaleString("en-US",{maximumFractionDigits:0})}</td><td style={cs(0,0,1)}/><td style={{...cs(0,0,1),textAlign:"right"}}>{f(m.lotsCalc.reduce((a,l)=>a+l.gross,0))}</td><td style={{...cs(0,0,1),textAlign:"right"}}>{f(m.totalLotRev)}</td><td style={cs(0,0,1)}/></tr>
  </tbody></table>);
}

function SSAssum({m,params,f,fp,cs}){
  const secs=[{t:"Project Overview",r:[["Project Name","ITPH"],["Location","Houston, TX"],["# of Lots",m.lotsCalc.length],["Land Size","136 acres"]]},{t:"Project Budget",r:[["Hard Costs",f(m.totalHard)],["Soft Costs",f(m.totalSoft)],["Deemed Land Value",f(m.equity)],["Developer Fee",f(m.totalDevFee)],["Subtotal Unlevered",f(m.totalUnlev),1],["Finance Costs",f(m.totalFin)],["Total Project Cost",f(m.totalCost),1]]},{t:"MUD Bonds",r:[["MUD Principal",f(params.mudTotal)],["1st Issuance Mo",params.mudMonth1],["2nd Issuance Mo",params.mudMonth2]]},{t:"Equity Partner",r:[["Deemed Capital",f(params.equity)],["Pref Return",fp(params.prefReturn)],["Profit Split",fp(params.equityPct)]]},{t:"Returns (Waterfall)",r:[["Revenue",f(m.totalRev)],["Cost",f(m.totalCost)],["Project Gross Margin",f(m.totalProfit),1],["Preferred Return (8%)",f(m.eqTotalPref)],["Equity Profit Share ("+((m.equityPct*100).toFixed(0))+"% of residual)",f(m.eqTotalFinal)],["Developer Profit Share ("+((m.devPct*100).toFixed(0))+"% of residual)",f(m.devNetProfit)],["Equity Total Profit",f(m.eqTotalPref+m.eqTotalFinal),1]]}];
  return(<table style={{width:"100%",borderCollapse:"collapse"}}><tbody>
    {secs.map((s,si)=><React.Fragment key={si}><tr><td colSpan={3} style={{...cs(0,1),background:NAVY,color:"white",fontWeight:700,padding:"8px 10px",fontSize:12}}>{s.t}</td></tr>
      {s.r.map(([l,v,tot],ri)=><tr key={ri} style={{background:ri%2?"#FAFBFC":"white"}}><td style={{...cs(0,1,!!tot),width:240}}>{l}</td><td style={{...cs(0,0,!!tot),textAlign:"right",width:180,fontWeight:tot?700:400}}>{v}</td><td style={cs(0)}/></tr>)}
      {si<secs.length-1&&<tr><td colSpan={3} style={{height:6}}/></tr>}
    </React.Fragment>)}
  </tbody></table>);
}

function SSCF({m,f,cs,ml,rng}){
  const rows=[{l:"Revenue",h:1},{l:"  Lot Proceeds",d:m.lotRevenue,t:m.totalLotRev},{l:"  MUD Paydown",d:m.mudRevenue,t:m.totalMudRev},{l:"Total Revenue",d:m.totalRevenue,t:m.totalRev,tot:1},{s:1},{l:"Costs",h:1},{l:"  Land/Deemed Capital",d:m.landMo,t:m.equity},{l:"  Hard Costs",d:m.hardCostMo,t:m.totalHard},{l:"  Soft Costs",d:m.softCostMo,t:m.totalSoft},{l:"  Dev Fee",d:m.devFeeMo,t:m.totalDevFee},{l:"Total Unlev Costs",d:m.unleveredCost,t:m.totalUnlev,tot:1},{s:1},{l:"Levered Net CF",d:m.leveredCF,t:m.leveredCF.reduce((a,b)=>a+b,0),tot:1,hl:1},{s:1},{l:"Loan",h:1},{l:"  Beg Bal",d:m.loanBeg},{l:"  End Bal",d:m.loanEnd}];
  return(<div style={{overflowX:"auto"}}><table style={{borderCollapse:"collapse",minWidth:rng.length*85+260}}><thead><tr>
    <th style={{...cs(1),position:"sticky",left:0,zIndex:2,minWidth:180}}>Line Item</th><th style={{...cs(1),minWidth:100}}>Total</th>
    {rng.map(i=><th key={i} style={{...cs(1),minWidth:80,textAlign:"center",fontSize:10}}><div>Mo {i}</div><div style={{fontWeight:400,opacity:0.7}}>{ml[i]}</div></th>)}
  </tr></thead><tbody>
    {rows.map((r,ri)=>{if(r.s)return<tr key={ri}><td colSpan={rng.length+2} style={{height:5}}/></tr>;if(r.h)return<tr key={ri}><td colSpan={rng.length+2} style={{...cs(0,1),background:NAVY,color:"white",padding:"7px 10px",fontSize:11}}>{r.l}</td></tr>;return(
      <tr key={ri} style={{background:r.hl?"#EBF5FB":ri%2?"#FAFBFC":"white"}}>
        <td style={{...cs(0,1,!!r.tot),position:"sticky",left:0,zIndex:1,background:r.hl?"#EBF5FB":r.tot?LIGHT:ri%2?"#FAFBFC":"white"}}>{r.l}</td>
        <td style={{...cs(0,0,!!r.tot),textAlign:"right",fontWeight:700,background:r.hl?"#D6EAF8":r.tot?LIGHT:"transparent"}}>{r.t!==undefined?f(r.t):""}</td>
        {rng.map(i=>{const v=r.d?r.d[i]:0;return<td key={i} style={{...cs(0,0,!!r.tot,v<-0.5),textAlign:"right",fontSize:10,background:r.hl?"#EBF5FB":r.tot?LIGHT:"transparent"}}>{Math.abs(v)<0.5?"\u2014":f(v)}</td>;})}
      </tr>);})}
  </tbody></table></div>);
}

function SSEWF({m,f,cs,ml,rng}){
  let cum=0;const cumArr=m.leveredCF.map(cf=>{cum+=cf;return cum;});
  const rows=[{l:"100% Cash Flows",h:1},{l:"Cash Flow Stream",d:m.leveredCF,t:m.leveredCF.reduce((a,b)=>a+b,0)},{l:"Cumulative",d:cumArr},{s:1},{l:"Equity Partner",h:1},{l:"  Beg Balance",d:m.eqBeg},{l:"  Contributions",d:m.eqContrib,t:m.eqTotalContrib},{l:"  Pref Return",d:m.eqPref,t:m.eqTotalPref},{l:"  Distributions",d:m.eqDist,t:-m.eqTotalDist},{l:"  End Balance",d:m.eqEnd,tot:1},{s:1},{l:"Remaining CF",d:m.remaining},{s:1},{l:"Final Split",h:1},{l:`  Equity Profit Share (${(m.equityPct*100).toFixed(0)}%)`,d:m.eqFinalDist,t:m.eqTotalFinal},{l:`  Developer Promote (${(m.devPct*100).toFixed(0)}%)`,d:m.devFinalDist,t:m.devNetProfit},{s:1},{l:"Equity Net CF",d:m.eqContrib.map((c,i)=>-c+(-m.eqDist[i])+m.eqFinalDist[i]),t:m.eqNetProfit,tot:1,hl:1}];
  return(<div style={{overflowX:"auto"}}><table style={{borderCollapse:"collapse",minWidth:rng.length*85+260}}><thead><tr>
    <th style={{...cs(1),position:"sticky",left:0,zIndex:2,minWidth:200}}>Line Item</th><th style={{...cs(1),minWidth:100}}>Total</th>
    {rng.map(i=><th key={i} style={{...cs(1),minWidth:80,textAlign:"center",fontSize:10}}><div>Mo {i}</div><div style={{fontWeight:400,opacity:0.7}}>{ml[i]}</div></th>)}
  </tr></thead><tbody>
    {rows.map((r,ri)=>{if(r.s)return<tr key={ri}><td colSpan={rng.length+2} style={{height:5}}/></tr>;if(r.h)return<tr key={ri}><td colSpan={rng.length+2} style={{...cs(0,1),background:NAVY,color:"white",padding:"7px 10px",fontSize:11}}>{r.l}</td></tr>;return(
      <tr key={ri} style={{background:r.hl?"#EBF5FB":ri%2?"#FAFBFC":"white"}}>
        <td style={{...cs(0,1,!!r.tot),position:"sticky",left:0,zIndex:1,background:r.hl?"#EBF5FB":r.tot?LIGHT:ri%2?"#FAFBFC":"white"}}>{r.l}</td>
        <td style={{...cs(0,0,!!r.tot),textAlign:"right",fontWeight:700,background:r.hl?"#D6EAF8":r.tot?LIGHT:"transparent"}}>{r.t!==undefined?f(r.t):""}</td>
        {rng.map(i=>{const v=r.d?r.d[i]:0;return<td key={i} style={{...cs(0,0,!!r.tot,v<-0.5),textAlign:"right",fontSize:10,background:r.hl?"#EBF5FB":r.tot?LIGHT:"transparent"}}>{Math.abs(v)<0.5?"\u2014":f(v)}</td>;})}
      </tr>);})}
  </tbody></table></div>);
}

// ═══════════════════════════════════════════════════════════════
// TAB 9: DATA VAULT
// ═══════════════════════════════════════════════════════════════
const VAULT_CATEGORIES = [
  {
    name: "Financial Models", icon: "\ud83d\udcca",
    docs: [
      { name: "ITPH Financial Model v9.xlsx", desc: "Complete working financial model with lot schedule, cash flows, equity waterfall", type: "xlsx", placeholder: false },
      { name: "OPC Breakdown.xlsx", desc: "Opinion of Probable Cost by construction phase", type: "xlsx", placeholder: false },
    ]
  },
  {
    name: "Project Documents", icon: "\ud83d\udccb",
    docs: [
      { name: "Equity Investment Presentation", desc: "Confidential investor presentation — ITP Houston equity opportunity", type: "pdf", placeholder: false },
      { name: "Equity Investment Proposal.docx", desc: "Confidential investment memorandum for equity partners", type: "docx", placeholder: false },
      { name: "Project Summary.pdf", desc: "Executive summary of ITP Houston development", type: "pdf", placeholder: false },
    ]
  },
  {
    name: "Engineering & Infrastructure", icon: "\ud83c\udfd7\ufe0f",
    docs: [
      { name: "Site Plan.pdf", desc: "", type: "pdf", placeholder: true },
      { name: "MUD Bond Documentation.pdf", desc: "", type: "pdf", placeholder: true },
      { name: "Environmental Reports.pdf", desc: "", type: "pdf", placeholder: true },
    ]
  },
  {
    name: "Maps & Plans", icon: "\ud83d\udcd0",
    docs: [
      { name: "Master Plan.pdf", desc: "", type: "pdf", placeholder: true },
      { name: "Lot Map.pdf", desc: "", type: "pdf", placeholder: true },
      { name: "Infrastructure Phasing Plan.pdf", desc: "", type: "pdf", placeholder: true },
    ]
  },
  {
    name: "Legal & Compliance", icon: "\u2696\ufe0f",
    docs: [
      { name: "Joint Venture Agreement.pdf", desc: "", type: "pdf", placeholder: true },
      { name: "MUD District Documentation.pdf", desc: "", type: "pdf", placeholder: true },
    ]
  },
  {
    name: "Media & Marketing", icon: "\ud83d\udcf8",
    docs: [
      { name: "Aerial Photography.zip", desc: "", type: "zip", placeholder: true },
      { name: "Marketing Presentation.pptx", desc: "", type: "pptx", placeholder: true },
    ]
  },
];

const FILE_TYPE_COLORS = { pdf: "#E85D75", xlsx: "#2E8B57", docx: "#3D8EC9", pptx: "#C4703E", png: "#D4A84B", zip: "#7A8B9A", jpg: "#D4A84B" };

function DataVaultTab() {
  const [unlocked,setUnlocked]=useState(false);
  const [code,setCode]=useState("");
  const [codeError,setCodeError]=useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [uploadCategory, setUploadCategory] = useState(null);

  useEffect(() => {
    if (unlocked) fetchDocuments();
  }, [unlocked]);

  async function fetchDocuments() {
    const { data } = await supabase.from("vault_documents").select("*").order("uploaded_at", { ascending: false });
    if (data) setDocuments(data);
  }




  async function handleUpload(category, file) {
    if (!file) return;
    setUploading(category);
    setUploadProgress(10);

    const ext = file.name.split(".").pop().toLowerCase();
    const folderName = category.replace(/[^a-zA-Z0-9]/g, "_");
    const filePath = folderName + "/" + Date.now() + "_" + file.name;

    setUploadProgress(30);
    const { error: storageError } = await supabase.storage.from("itph-data-vault").upload(filePath, file);
    if (storageError) { console.error(storageError); setUploading(null); return; }

    setUploadProgress(70);
    const { error: dbError } = await supabase.from("vault_documents").insert({
      name: file.name,
      description: "",
      category: category,
      file_path: filePath,
      file_type: ext,
      file_size: file.size,
    });

    setUploadProgress(100);
    if (!dbError) await fetchDocuments();
    setTimeout(() => { setUploading(null); setUploadProgress(0); }, 500);
  }

  function getDocUrl(filePath) {
    const { data } = supabase.storage.from("itph-data-vault").getPublicUrl(filePath);
    return data.publicUrl;
  }

  const totalDocs = documents.length;
  const totalCategories = VAULT_CATEGORIES.length;

  return (
    <div>
      <SectionTitle icon={"\ud83d\udcc1"}>Project Data Vault</SectionTitle>
      <div style={{ fontSize: 12, color: "#7A8B9A", marginBottom: 16 }}>
        Secure document repository for ITP Houston project materials. All documents are confidential and for authorized recipients only.
      </div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: LIGHT, padding: "8px 16px", borderRadius: 8, fontSize: 12, color: NAVY, fontWeight: 600, marginBottom: 24 }}>
        <FileText size={14} /> {totalDocs} documents across {totalCategories} categories
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {VAULT_CATEGORIES.map(cat => {
          const catDocs = documents.filter(d => d.category === cat.name);
          return (
            <div key={cat.name} style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{cat.icon}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>{cat.name}</span>
                  <span style={{ background: STEEL + "30", color: TEAL, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>{catDocs.length}</span>
                </div>
                <button
                  onClick={() => { setUploadCategory(cat.name); fileInputRef.current && fileInputRef.current.click(); }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 4, background: TERRA, color: "white", border: "none", padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                >
                  <Upload size={12} /> Upload
                </button>
              </div>

              {uploading === cat.name && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ background: "#F0F2F4", borderRadius: 4, height: 6, overflow: "hidden" }}>
                    <div style={{ width: uploadProgress + "%", height: "100%", background: TEAL, borderRadius: 4, transition: "width 0.3s" }} />
                  </div>
                  <div style={{ fontSize: 10, color: "#7A8B9A", marginTop: 4 }}>Uploading... {uploadProgress}%</div>
                </div>
              )}

              {/* Uploaded documents */}
              {catDocs.map(doc => (
                <div key={doc.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F0F2F4" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: NAVY, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                      <span style={{ background: (FILE_TYPE_COLORS[doc.file_type] || "#7A8B9A") + "26", color: FILE_TYPE_COLORS[doc.file_type] || "#7A8B9A", fontSize: 10, padding: "3px 8px", borderRadius: 4, fontWeight: 700, textTransform: "uppercase" }}>{doc.file_type}</span>
                      <span style={{ fontSize: 12, color: "#7A8B9A" }}>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                      {doc.file_size && <span style={{ fontSize: 12, color: "#7A8B9A" }}>{(doc.file_size / 1024).toFixed(0)} KB</span>}
                    </div>
                  </div>
                  <a href={getDocUrl(doc.file_path)} download style={{ display: "inline-flex", alignItems: "center", gap: 4, border: "1.5px solid " + STEEL, color: TEAL, background: "white", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, textDecoration: "none", cursor: "pointer" }}>
                    <Download size={12} /> Download
                  </a>
                </div>
              ))}

              {/* Placeholder documents */}
              {cat.docs.filter(d => d.placeholder && !catDocs.find(cd => cd.name === d.name)).map(doc => (
                <div key={doc.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #E0E4E8" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: "#B0BEC5", fontWeight: 500 }}>{doc.name}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                      <span style={{ background: "#F0F2F4", color: "#B0BEC5", fontSize: 10, padding: "3px 8px", borderRadius: 4, fontWeight: 700, textTransform: "uppercase" }}>{doc.type}</span>
                      <span style={{ fontSize: 12, color: "#B0BEC5" }}>Pending upload</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: "#B0BEC5", fontStyle: "italic" }}>Coming soon</span>
                </div>
              ))}

              {/* Non-placeholder docs that haven't been uploaded yet */}
              {cat.docs.filter(d => !d.placeholder && !catDocs.find(cd => cd.name === d.name)).map(doc => (
                <div key={doc.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F0F2F4" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: "#7A8B9A", fontWeight: 500 }}>{doc.name}</div>
                    {doc.desc && <div style={{ fontSize: 11, color: "#9AA5B0", marginTop: 2 }}>{doc.desc}</div>}
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                      <span style={{ background: (FILE_TYPE_COLORS[doc.type] || "#7A8B9A") + "26", color: FILE_TYPE_COLORS[doc.type] || "#7A8B9A", fontSize: 10, padding: "3px 8px", borderRadius: 4, fontWeight: 700, textTransform: "uppercase" }}>{doc.type}</span>
                      <span style={{ fontSize: 12, color: "#B0BEC5" }}>Not yet uploaded</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.xlsx,.docx,.pptx,.png,.jpg,.zip"
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files[0] && uploadCategory) {
            handleUpload(uploadCategory, e.target.files[0]);
          }
          e.target.value = "";
        }}
      />

      <div style={{ textAlign: "center", marginTop: 32, padding: 16, fontSize: 11, color: "#7A8B9A", borderTop: "1px solid #E0E4E8" }}>
        <div>Documents are confidential. Distribution requires written authorization.</div>
        <div style={{ marginTop: 6, opacity: 0.7 }}>Powered by PLUSAdvantage™</div>
      </div>
    </div>
  );
}

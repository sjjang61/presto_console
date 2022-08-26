# -*- coding: utf-8 -*-
import json
from flask import render_template
from flask import Flask
from flask import request, json
import platform
# from aiptlabpy.connector.presto_connector import PrestoConnector
# source /home/cloudera-scm/ds3/bin/activate;

app = Flask(__name__, static_url_path='/templates')

if platform.system() in [ 'Windows', 'Darwin' ]:
    is_local_test = True
    presto = None
else:
    is_local_test = False
    #presto = PrestoConnector()

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/popup', methods=['GET'])
def index_popup():
    return render_template('popup.html')

@app.route('/catalog', methods=['GET'])
def select_catalog():
    """
    sample
    REQ : wget "http://localhost:20000/catalog"
    RES : {"Catalog": {"0": "apollo", "1": "apollo_calendar", "2": "apollo_game", "3": "apollo_mongodb", "4": "app",
                 "5": "call", "6": "ddb", "7": "es", "8": "hive", "9": "imh", "10": "mongo", "11": "mongo_stg",
                 "12": "nsmh", "13": "nudge", "14": "nugubill", "15": "opal", "16": "openplay", "17": "pdb",
                 "18": "probit", "19": "smh", "20": "smv", "21": "system"}}
    """
    if is_local_test == True:
        catalog_list = { "0" : "apollo", "1" : "apollo_calendar", "2" : "apollo_game", "3": "apollo_mongodb", "4": "hive" }
    else:
        catalog_list = presto.get_dataframe("""show catalogs""")['Catalog'].to_dict()

    return makeResponse(catalog_list)

@app.route('/schema', methods=['GET'])
def select_schema():
    """
    sample
    REQ : wget "http://localhost:20000/catalog?catalog=apollo"
    RES : {"Schema": {"0": "apollo_db", "1": "information_schema"}}

    REQ : wget "http://localhost:20000/catalog?catalog=hive"
    RES : {"Schema": {"0": "ai", "1": "analysis", "2": "apollo", "3": "archon", "4": "default", "5": "es", ...
        "11": "nugu", "12": "probit", "13": "profile", "14": "raw_data", "15": "shaker"}}
    """
    catalog = request.args.get( 'catalog')
    print( "[REQ] schema => catalog : %s" % ( catalog ))

    if is_local_test == True:
        schema_list = { "0" : "ai", "1" : "apollo", "2" : "archon", "3" : "jab_db", "4" : "es" }
    else:
        schema_list = presto.get_dataframe("""
            show schemas from {catalog}
        """.format(catalog=catalog))['Schema'].to_dict()

    print("[RES] schema => %s" % (schema_list))
    return makeResponse(schema_list)

@app.route('/table', methods=['GET'])
def select_table():
    """
    sample
    REQ : wget "http://localhost:20000/table?schema=probit&catalog=hive"
    RES :
    {"Table":
        {"0": "ai_record_keyword_log_orc", "1": "ai_record_survey_log_orc", "2": "call_statics", "3": "call_statics_dly",
        "4": "call_statics_usr_dly", "5": "client_usage_lbs_log_orc", "6": "mkt_imp_item_log_orc"}
    }
    """
    catalog = request.args.get('catalog')
    schema = request.args.get('schema')
    print("[REQ] table => catalog : %s, schema : %s" % (catalog, schema))

    if is_local_test == True:
        table_list = { "0" : "table1", "1" :"table2", "2" :"table3", "3" :"table4", "4" :"table5" }
    else:
        table_list = presto.get_dataframe("""
            show tables from {catalog}.{schema}
        """.format(catalog=catalog, schema=schema))['Table'].to_dict()

    print("[RES] table => %s" % (table_list))
    return makeResponse(table_list)

@app.route('/column', methods=['GET'])
def select_column():
    """
    sample : 위와 동일한 인터페이스로 변경
    REQ : wget "http://localhost:20000/column?schema=probit&catalog=hive&table=t_dm_ux_ver"
    RES : { 0 : "svc_cd", "app_id", "app_ver", "ux_ver"]
    """

    catalog = request.args.get('catalog')
    schema = request.args.get('schema')
    table = request.args.get('table')
    print("[REQ] column => catalog : %s, schema : %s, table : %s" % (catalog, schema, table))

    if is_local_test == True:
        column_list = { "0" : "column1", "1": "column2", "2": "column3", "3":"column4", "4" : "column5" }
    else:
        column_list = presto.get_dataframe("""
            desc  {catalog}.{schema}.{table}
        """.format(catalog=catalog, schema=schema, table=table))['Column'].to_dict()

    print("[RES] column => %s" % (column_list))
    return makeResponse(column_list)

@app.route('/dataframe', methods=['GET'])
def select_dataframe():
    """
    sample
    wget "http://localhost:20000/dataframe?schema=probit&catalog=hive&table=t_dm_ux_ver&column_list=svc_cd,app_id"

    {
    "app_id": {"0": "apollo", "1": "apollo_ios", "2": "btv_stb_android"},
    "svc_cd": {"0": "apollo", "1": "apollo", "2": "btv_stb"}
    }

    [{"app_id": "apollo", "svc_cd": "apollo"}, {"app_id": "apollo_ios", "svc_cd": "apollo"}, {"app_id": "btv_stb_android", "svc_cd": "btv_stb"},
    """

    catalog = request.args.get('catalog')
    schema = request.args.get('schema')
    table = request.args.get('table')
    column_list_str = request.args.get('column_list')
    print("[REQ] dataframe => catalog : %s, schema : %s, table : %s, column_list : %s" % (catalog, schema, table, column_list_str))

    if is_local_test == True:
        dataframe = [
            { "column01" : 111, "column02" : 222, "column03" : 333, "column04" : 444, "column05" : "{ \"age\" : 10, \"name\" : \"Abc\", \"list\" : [ { \"subject\" : \"math\" }, {\"subject\" : \"korean\"}] }",
              "column06" : 111, "column07" : 222, "column08" : 333, "column09" : 444, "column10" : 555,
              "column11" : 111, "column12" : 222, "column13" : 333, "column14" : 444, "column15" : 555,
              "column16" : 111, "column17" : 222, "column18" : 333, "column19" : 444, "column20" : 555,
              "column21" : 111, "column22" : 222, "column23" : 333, "column24" : 444, "column25" : 555,
              "column26" : 111, "column27" : 222, "column28" : 333, "column29" : 444, "column30" : 555,
              "column31": 111, "column32": 222, "column33": 333, "column34": 444, "column35": 555,
              "column36": 111, "column37": 222, "column38": 333, "column39": 444, "column40": 555
              },
            { "column01" : 111, "column02" : 222, "column03" : 333, "column04" : 444, "column05" : "{ \"list\" : [ { \"subject\" : \"math\" }, {\"subject\" : \"korean\"}] }",
              "column06" : 111, "column07" : 222, "column08" : 333, "column09" : 444, "column10" : 555,
              "column11" : 111, "column12" : 222, "column13" : 333, "column14" : 444, "column15" : 555,
              "column16" : 111, "column17" : 222, "column18" : 333, "column19" : 444, "column20" : 555,
              "column21": 111, "column22": 222, "column23": 333, "column24": 444, "column25": 555,
              "column26": 111, "column27": 222, "column28": 333, "column29": 444, "column30": 555,
              "column31": 111, "column32": 222, "column33": 333, "column34": 444, "column35": 555,
              "column36": 111, "column37": 222, "column38": 333, "column39": 444, "column40": 555
              }
        ]
    else:
        dataframe = presto.get_dataframe("""
             select {column} from {catalog}.{schema}.{table}
             limit 20
        """.format(catalog=catalog, schema=schema, table=table, column=column_list_str)).to_dict(orient='records')

    print("[RES] dataframe => %s" % (dataframe))
    return makeResponse(dataframe)


@app.route('/sql', methods=['POST'])
def select_sql():
    """
    sample
    wget "http://localhost:20000/sql"

    [{"app_id": "apollo", "svc_cd": "apollo"}, {"app_id": "apollo_ios", "svc_cd": "apollo"}, {"app_id": "btv_stb_android", "svc_cd": "btv_stb"},
    """

    sql = request.get_json()['sql']
    print("[REQ] dataframe => sql : %s" % (sql))

    if is_local_test == True:
        dataframe = [
            { "sql1" : 111, "sql2" : 222, "sql3" : 333, "sql4" : 444, "sql5" : 555, "sql6" : 666},
            { "sql1" : 1110, "sql2" : 2220, "sql3" : 3330, "sql4" : 4440, "sql5" : 5550, "sql6" : 666}
        ]
    else:
        # exception 처리
        dataframe = presto.get_dataframe("""
             {sql}             
        """.format(sql=sql)).to_dict(orient='records')

    print("[RES] dataframe => %s" % (dataframe))
    return makeResponse(dataframe)

def makeResponse( content_list ):

    # res = {
    #     "HEADER" : {
    #         "MSG" : "",
    #     },
    #     "BODY" : content_list
    # }

    response = app.response_class(
        response=json.dumps(content_list),
        status=200,
        mimetype='application/json'
    )
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=20000, debug=True)

import psycopg2
import ssl

try:
    conn = psycopg2.connect(
        host='aws-0-eu-west-1.pooler.supabase.com',
        port=6543,
        dbname='postgres',
        user='postgres.trhwdsnrjqpflenkvrxx',
        password='allolalolyallola',
        sslmode='require'
    )
    print('Connected!')
    conn.close()
except Exception as e:
    print('Error:', e)
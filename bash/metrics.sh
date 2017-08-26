d_t=$(df | grep "/$" | awk '{print $2;}')
d_u=$(df | grep "/$" | awk '{print $3;}')
m_t=$(free | grep Mem | awk '{print $2;}')
m_u=$(free | grep Mem | awk '{print $3;}')
curl -H "Content-Type: application/json" -X POST -d '{"d_t":'$d_t',"d_u":'$d_u',"m_t":'$m_t',"m_u":'$m_u'}' https://optimus-hariaakash.rhcloud.com/server/metrics/$1/$2
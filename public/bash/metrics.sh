d_t=$(df | grep "/$" | awk '{print $2;}')
d_u=$(df | grep "/$" | awk '{print $3;}')
m_t=$(free | grep Mem | awk '{print $2;}')
m_u=$(free | grep Mem | awk '{print $3;}')
cpu=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
#p=$(top -bn 1 | grep "^ " | awk '{ printf("%-8s  %-8s  %-8s\n", $9, $10, $12); }' | head -n 6 | tail -n 5)
curl -H "Content-Type: application/json" -X POST -d '{"d_t":'$d_t',"d_u":'$d_u',"m_t":'$m_t',"m_u":'$m_u',"cpu":'$cpu'}' https://optimuscp.io/webapi/server/metrics/$1/$2

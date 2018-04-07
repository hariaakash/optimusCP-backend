d_t=$(df | grep "/$" | awk '{print $2;}')
d_u=$(df | grep "/$" | awk '{print $3;}')
m_t=$(free | grep Mem | awk '{print $2;}')
m_u=$(free | grep Mem | awk '{print $3;}')
cpu=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
echo $d_t:$d_u:$m_t:$m_u:$cpu

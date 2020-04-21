#include <stdio.h>
#include <string.h>
#include <zmq.h>

void * context; //Global context, because you only need one !

int main( int argc, char * argv[] )
{
    printf("Started\n");
    context = zmq_ctx_new();

    void * pusher = zmq_socket( context, ZMQ_PUSH );
    void * subscriber = zmq_socket( context, ZMQ_SUB);

    zmq_connect( pusher, "tcp://benternet.pxl-ea-ict.be:24041" );
    zmq_connect( subscriber, "tcp://benternet.pxl-ea-ict.be:24042" );

    zmq_setsockopt(pusher,ZMQ_SUBSCRIBE,"example>task?>Cyril Knops>", 26);
    zmq_setsockopt(subscriber,ZMQ_SUBSCRIBE,"example>task!>Cyril Knops>", 26);
    zmq_setsockopt(pusher,ZMQ_SUBSCRIBE,"example>answer?>Cyril Knops>", 28);
    zmq_setsockopt(subscriber,ZMQ_SUBSCRIBE,"example>answer!>Cyril Knops>", 28);

    zmq_send( pusher, "example>task?>Cyril Knops>", 26, 0 );
    printf("Send\n");

    char string[1000] = "";
    zmq_msg_t msg;

   int rc = zmq_msg_init (&msg);
   rc = zmq_recvmsg (subscriber, &msg, 0);
   int size = zmq_msg_size (&msg);
   memcpy(string, zmq_msg_data(&msg), size);
   zmq_msg_close(&msg);
   string[size] = 0;
   printf("%s\n", string);
    zmq_msg_close (&msg);


    zmq_send( pusher, "example>answer?>Cyril Knops>CORONA-FREE-CHANNEL>b5e440f63b9b265dc500208c16343099bdce0b73>*HATSJU*>", 99, 0 );
    zmq_msg_t msg2;
    int rc2 = zmq_msg_init (&msg2);
    rc = zmq_recvmsg (subscriber, &msg2, 0);
    int size2 = zmq_msg_size (&msg2);
       memcpy(string, zmq_msg_data(&msg2), size);
       zmq_msg_close(&msg2);
       string[size2] = 0;
       printf("%s\n", string);
    zmq_msg_close (&msg2);


    zmq_close( pusher );
    zmq_close( subscriber );
    zmq_ctx_shutdown( context );
    zmq_ctx_term( context );

    return 0;
}

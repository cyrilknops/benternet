#include <iostream>
#include <zmq.hpp>
#include <nzmqt/nzmqt.hpp>
using namespace std;

int main()
{
	cout << "Hello World!" << endl;
	try
	{
		nzmqt::ZMQContext *context = nzmqt::createDefaultContext();
		nzmqt::ZMQSocket *socket = context->createSocket( nzmqt::ZMQSocket::TYP_PUB, context );
        socket->bindTo("tcp://benternet.pxl-ea-ict.be:24041");
		nzmqt::ZMQMessage msg = nzmqt::ZMQMessage(QString("HELLO WORLD!").toUtf8());
		while( true )
		{
			system("pause");
			socket->sendMessage(msg);
		}
	}
	catch( nzmqt::ZMQException &ex )
	{
		std::cerr << "Catched an exception : " << ex.what();
	}
	return 0;
}

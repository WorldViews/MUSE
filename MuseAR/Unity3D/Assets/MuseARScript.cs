using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using SocketIO;

public class MuseARScript : SocketIOComponent
{
    public int numSteps = 0;
    public GameObject fpc = null;
    public Camera cam = null;
    System.Action<SocketIOEvent> callback = null;

    // Use this for initialization
    void Start () {
        //url = "ws://localhost:4000/socket.io/?EIO=4&transport=websocket";
        Debug.Log("I was started now!");
        Debug.Log("server URL is: " + url);
        base.Start();
        Debug.Log("server URL is: " + url);
        fpc = GameObject.Find("First Person Camera");
        this.On("MUSE.AR", OnMuseAR);
	}
	
	// Update is called once per frame
	void Update () {
        base.Update();
        numSteps++;
        if (numSteps % 2 == 0)
        {
            Debug.Log("tick...");
            string evType = "MUSE.AR";
            JSONObject obj = new JSONObject();
            obj.AddField("msgType", "pose");
            obj.AddField("size", "big");
            obj.AddField("step", numSteps);
            if (fpc != null)
            {
                Vector3 pos = fpc.transform.position;
                Vector3 rot = fpc.transform.rotation.eulerAngles;
                obj.AddField("position", JSONVector(pos));
                obj.AddField("euler", JSONVector(rot));
                obj.AddField("localToWorld", JSONVector(fpc.transform.localToWorldMatrix));
               // AddField(obj, "position", pos);
               // AddField(obj, "euler", rot);
            }
            this.Emit(evType, obj);
        }
	}

    static JSONObject JSONVector(Vector3 vec)
    {
        JSONObject jvec = new JSONObject();
        jvec.Add(vec.x); jvec.Add(vec.y); jvec.Add(vec.z);
        return jvec;
    }

    static JSONObject JSONVector(Vector4 vec)
    {
        JSONObject jvec = new JSONObject();
        jvec.Add(vec.w); jvec.Add(vec.x); jvec.Add(vec.y); jvec.Add(vec.z);
        return jvec;
    }

    static JSONObject JSONVector(Matrix4x4 mat)
    {
        JSONObject jvec = new JSONObject();
         for (int i = 0; i < 4; i++)
            jvec.Add(JSONVector(mat.GetRow(i)));
         return jvec;
    }

    /*
    static void AddField(JSONObject obj, string name, Vector3 vec)
    {
        //obj.AddField(name + ".x", vec.x);
        //obj.AddField(name + ".y", vec.y);
        //obj.AddField(name + ".z", vec.z);
        JSONObject jvec = new JSONObject();
        jvec.Add(vec.x); jvec.Add(vec.y); jvec.Add(vec.z);
        obj.AddField(name, jvec);
        obj.Add
    }

    static void AddField(JSONObject obj, string name, Vector4 vec)
    {
        JSONObject jvec = new JSONObject();
        jvec.Add(vec.w); jvec.Add(vec.x); jvec.Add(vec.y); jvec.Add(vec.z);
        obj.AddField(name, jvec);
    }

    static void AddField(JSONObject obj, string name, Matrix4x4 mat)
    {
        //obj.AddField(name + ".x", vec.x);
        //obj.AddField(name + ".y", vec.y);
        //obj.AddField(name + ".z", vec.z);
        JSONObject jvec = new JSONObject();
        mat.GetRow()
        jvec.Add(vec.x); jvec.Add(vec.y); jvec.Add(vec.z);
        obj.AddField(name, jvec);
    }
    */

    void OnMuseAR(SocketIOEvent e)
    {
        Debug.Log("Got MUSE.AR event");
        JSONObject obj = e.data;
        string msgType = "";
        obj.GetField(ref msgType, "msgType");
        if (msgType.Equals("reset"))
        {
            OnMuseReset(obj);
        }
        else if (msgType.Equals("pose"))
        {
            Debug.Log("Unexpected pose message");
        }
        else
        {
            Debug.Log("Unexpected type: " + msgType);
        }
    }

    void OnMuseReset(JSONObject obj)
    {
        Debug.Log("Reset");
    }
}

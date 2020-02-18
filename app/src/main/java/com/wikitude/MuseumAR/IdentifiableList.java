package com.wikitude.MuseumAR;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.res.AssetManager;
import android.content.res.XmlResourceParser;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.AdapterView;
import android.widget.BaseAdapter;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.xmlpull.v1.XmlPullParser;
import org.xmlpull.v1.XmlPullParserException;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;

public class IdentifiableList extends AppCompatActivity{
    private static final String TAG = "IdentifiableList";
    private ListView listView;
    private ArrayList<String> titleList = new ArrayList<String>();
    private ArrayList<Bitmap> picList = new ArrayList<Bitmap>();
    private ArrayList<Integer> idList = new ArrayList<Integer>();
    //手指按下的点为(x1, y1)手指离开屏幕的点为(x2, y2)
    float x1 = 0;
    float x2 = 0;
    float y1 = 0;
    float y2 = 0;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.identifiable_list);

        listView = (ListView) findViewById(R.id.listView);
        MyBaseAdapter myBaseAdapter = new MyBaseAdapter();
        this.getData();
        listView.setAdapter(myBaseAdapter);
        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @SuppressLint("SetJavaScriptEnabled")
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                WebView webView;
                setContentView(R.layout.details);
                webView  = (WebView) findViewById(R.id.webview_compontent);
                webView.getSettings().setJavaScriptEnabled(true);
                WebSettings webSettings = webView.getSettings();
                webSettings.setLoadWithOverviewMode(true);
                webSettings.setUseWideViewPort(true);
                webSettings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK); //关闭webview中缓存
                webSettings.setAllowFileAccess(true); //设置可以访问文件
                webSettings.setJavaScriptCanOpenWindowsAutomatically(true); //支持通过JS打开新窗口
                webSettings.setLoadsImagesAutomatically(true); //支持自动加载图片
                webSettings.setDefaultTextEncodingName("utf-8");//设置编码格式
                webView.getSettings().setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
                webView.loadUrl("file:///android_asset/html/detail.html?id="+view.getId());
            }
        });
    }

    public void getData(){
        try {
            AssetManager assetManager = getAssets(); //获得assets资源管理器（assets中的文件无法直接访问，可以使用AssetManager访问）
            InputStreamReader inputStreamReader = new InputStreamReader(assetManager.open("items.json"),"UTF-8"); //使用IO流读取json文件内容
            BufferedReader br = new BufferedReader(inputStreamReader);//使用字符高效流
            String line;
            StringBuilder builder = new StringBuilder();
            while ((line = br.readLine())!=null){
                builder.append(line);
            }
            br.close();
            inputStreamReader.close();

            JSONObject testJson = new JSONObject(builder.toString()); // 从builder中读取了json中的数据。
            // 直接传入JSONObject来构造一个实例
            JSONArray array = testJson.getJSONArray("items");

            for (int i = 0;i<array.length();i++){
                JSONObject jsonObject = array.getJSONObject(i);
                idList.add(jsonObject.getInt("id"));
                titleList.add(jsonObject.getString("name"));
                Bitmap bitmap = null;
                try {
                    InputStream inputStream = assetManager.open("assets/items/"+jsonObject.getString("pic_path"));//filename是assets目录下的图片名
                    bitmap = BitmapFactory.decodeStream(inputStream);
                    picList.add(bitmap);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        } catch (IOException | JSONException e) {
            e.printStackTrace();
        }
    }
    class MyBaseAdapter extends BaseAdapter {

        @Override
        public int getCount() { return titleList.size(); }

        @Override
        public Object getItem(int position) {
            return titleList.get(position);
        }

        @Override
        public long getItemId(int position) {
            return position;
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            @SuppressLint("ViewHolder")
            //设计页面的listView内容
            View view = View.inflate(IdentifiableList.this, R.layout.identifiable_item, null);
            TextView title = (TextView) view.findViewById(R.id.item_title);
            ImageView pic = (ImageView) view.findViewById(R.id.item_pic);
            title.setText(titleList.get(position));
            //pic.setImageResource(picList.get(position));
            pic.setImageBitmap(picList.get(position));
            view.setId(idList.get(position));

            return view;
        }
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        //继承了Activity的onTouchEvent方法，直接监听点击事件
        if (event.getAction() == MotionEvent.ACTION_DOWN) {
            //当手指按下的时候
            x1 = event.getX();
            y1 = event.getY();
        }
        if (event.getAction() == MotionEvent.ACTION_MOVE) {
            //当手指滑动的时候
            x2 = event.getX();
            y2 = event.getY();
        }
        if (event.getAction()==MotionEvent.ACTION_UP){
            //当手指离开的时候
            if(y2 - y1 > 150) {
                Intent intent = new Intent(IdentifiableList.this, Home.class);
                startActivity(intent);
                overridePendingTransition(R.anim.in_from_down, R.anim.out_to_down);
            }
        }
        return super.onTouchEvent(event);
    }
}

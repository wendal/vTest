package org.vtest.model;

import java.sql.Timestamp;

import lombok.Data;

import org.nutz.dao.entity.annotation.ColDefine;
import org.nutz.dao.entity.annotation.ColType;
import org.nutz.dao.entity.annotation.Column;
import org.nutz.dao.entity.annotation.Comment;
import org.nutz.dao.entity.annotation.Id;
import org.nutz.dao.entity.annotation.Table;

@Table("t_robot")
@Data
public class Robot {
	@Id
	@Comment("主键")
	private int id;

	@Column
	@ColDefine(type = ColType.VARCHAR, width = 20)
	@Comment("机器人的 IP 地址")
	private String ipv4;
	
	@Column
	@Comment("机器人所在机器的名称")
	private String hnm;
	
	@Column
	@Comment("机器人进程的进程号")
	private String prid;
	
	@Column
	@Comment("最后心跳时间 ")
	private Timestamp lm;
}
